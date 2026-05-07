import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import User from "../../models/user.model.js";
import Product from "../../models/product.model.js";
import Order from "../../models/order.model.js";
import { connectTestDB, disconnectTestDB } from "../setup";

let dynamicUserId = "";
let dynamicProductId = "";

// Mock Stripe antes de importar o app
await jest.unstable_mockModule("../../lib/stripe.js", () => ({
    stripe: {
        checkout: {
            sessions: {
                create: jest.fn().mockImplementation(async ({ line_items }) => ({
                    id: "sess_test_123",
                    amount_total: line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0),
                    payment_status: "paid",
                    metadata: { userId: dynamicUserId },
                })),
                retrieve: jest.fn().mockImplementation(async (sessionId) => ({
                    id: sessionId,
                    payment_status: "paid",
                    amount_total: 10000,
                    metadata: { userId: dynamicUserId, products: JSON.stringify([{ id: dynamicProductId, quantity: 1, price: 100 }]) },
                })),
            },
        },
        coupons: {
            create: jest.fn().mockResolvedValue({ id: "coupon_test_123" }),
        },
    },
}));

// criar mock do cloudinary, aceitando os parametros e retornando uma resposta fake
await jest.unstable_mockModule("../../lib/cloudinary.js", () => ({
    default: {
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: "http://example.com/image.jpg",
            }),
            destroy: jest.fn().mockResolvedValue({
                result: "ok",
            }),
        },
    },
}));

// Importa o app depois do mock
const { default: app } = await import("../../app.js");

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe("E2E - User full flow", () => {
    let cookies;
    let product;
    let loggedUserId;

    it("should complete full user flow successfully", async () => {
        // 1️⃣ Criar usuário customer via rota de signup
        const signupRes = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "testuser@example.com",
                password: "password123"
            });

        loggedUserId = signupRes.body._id;
        dynamicUserId = loggedUserId; // atualiza mock do Stripe
        cookies = signupRes.headers['set-cookie'];

        // 2️⃣ Criar admin diretamente
        const admin = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "admin123",
            role: "admin"
        });

        const adminLoginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: admin.email, password: "admin123" });

        const adminCookies = adminLoginRes.headers['set-cookie'];

        // 3️⃣ Criar produto via admin
        const productRes = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                description: "Test product description",
                price: 100,
                category: "Test Category",
                image: "http://example.com/image.jpg"
            })
            .set("Cookie", adminCookies);

        product = productRes.body;
        dynamicProductId = product._id;

        // 4️⃣ Criar checkout session
        const checkoutRes = await request(app)
            .post("/api/payments/create-checkout-session")
            .send({ products: [{ productId: product._id, quantity: 1 }] })
            .set("Cookie", cookies);

        expect(checkoutRes.statusCode).toBe(200);
        expect(checkoutRes.body).toHaveProperty("id");

        // 5️⃣ Confirmar pagamento (checkout success)
        const successRes = await request(app)
            .post("/api/payments/checkout-success")
            .send({ sessionId: checkoutRes.body.id })
            .set("Cookie", cookies);

        expect(successRes.statusCode).toBe(200);
        expect(successRes.body).toHaveProperty("success", true);

        // 6️⃣ Verificar pedido criado
        const order = await Order.findOne({ user: loggedUserId });
        expect(order).not.toBeNull();
        expect(order.user.toString()).toBe(loggedUserId);
        expect(order.products.length).toBe(1);
        expect(order.products[0].product.toString()).toBe(product._id);
        expect(order.totalAmount).toBe(100);
    });
});