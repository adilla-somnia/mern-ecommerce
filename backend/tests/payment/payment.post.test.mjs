// backend/tests/payment.controller.test.mjs
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { connectTestDB, disconnectTestDB } from "../setup.js";
import User from "../../models/user.model.js";
import Product from "../../models/product.model.js";
import Coupon from "../../models/coupon.model.js";
import Order from "../../models/order.model.js";

// ⚡️ Mock Stripe antes de importar o app
await jest.unstable_mockModule("../../lib/stripe.js", () => ({
    stripe: {
        checkout: {
            sessions: {
                create: jest.fn().mockImplementation(async ({ line_items, discounts }) => ({
                    id: "sess_test_123",
                    amount_total: line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0) -
                        (discounts?.length ? 1000 : 0), // aplica 10$ desconto se houver cupom
                    payment_status: "paid",
                    metadata: {
                        userId: "user_test",
                        couponCode: discounts?.length ? "TEST10" : "",
                        products: JSON.stringify(line_items.map(li => ({
                            id: "prod_test",
                            quantity: li.quantity,
                            price: li.price_data.unit_amount / 100,
                        }))),
                    },
                })),
                retrieve: jest.fn().mockImplementation(async (sessionId) => ({
                    id: sessionId,
                    payment_status: "paid",
                    amount_total: 10000,
                    metadata: {
                        userId: "6637f2a4b8c1d2e3f4a56789",
                        couponCode: "TEST10",
                        products: JSON.stringify([{ id: "6637f2a4b8c1d2e3f4a56777", quantity: 1, price: 100 }]),
                    },
                })),
            },
        },
        coupons: {
            create: jest.fn().mockResolvedValue({ id: "coupon_test_123" }),
        },
    },
}));

const { default: app } = await import("../../app.js");

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe("Payment Controller", () => {
    let userCookie;
    let product;

    beforeAll(async () => {
        const user = await User.create({ name: "User", email: "user@example.com", password: "123456", role: "customer" });
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: "user@example.com", password: "123456" });
        userCookie = loginRes.headers["set-cookie"];

        product = await Product.create({
            name: "Test Product",
            description: "A test product",
            price: 100,
            category: "Test",
            image: "http://example.com/image.jpg"
        });

        await Coupon.create({
            code: "TEST10",
            discountPercentage: 10,
            isActive: true,
            userId: user._id,
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
    });

    describe("POST /api/payments/checkout", () => {
        it("should create a checkout session without coupon", async () => {
            const res = await request(app)
                .post("/api/payments/create-checkout-session")
                .set("Cookie", userCookie)
                .send({ products: [{ _id: product._id, name: product.name, price: product.price, quantity: 1, }], couponCode: '' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("id", "sess_test_123");
            expect(res.body.totalAmount).toBeDefined();
        });

        it("should create a checkout session with coupon", async () => {
            const res = await request(app)
                .post("/api/payments/create-checkout-session")
                .set("Cookie", userCookie)
                .send({
                    products: [{ _id: product._id, name: product.name, price: product.price, quantity: 1 }],
                    couponCode: "TEST10",
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("id", "sess_test_123");
            expect(res.body.totalAmount).toBeLessThan(100); // desconto aplicado
        });

        it("should fail with empty products", async () => {
            const res = await request(app)
                .post("/api/payments/create-checkout-session")
                .set("Cookie", userCookie)
                .send({ products: [] });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("POST /api/payments/success", () => {
        it("should complete checkout successfully", async () => {
            const res = await request(app)
                .post("/api/payments/checkout-success")
                .set("Cookie", userCookie)
                .send({ sessionId: "6637f2a4b8c1d2e3f4a56789" });

            console.log("CHEGUEI AQUI", res.body)
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("success", true);

            // verificar se order foi criado
            const order = await Order.findOne({ stripeSessionId: "6637f2a4b8c1d2e3f4a56789" });
            expect(order).not.toBeNull();
        });

        it("should fail with invalid sessionId", async () => {
            const { stripe } = await import("../../lib/stripe.js");
            stripe.checkout.sessions.retrieve.mockRejectedValueOnce(new Error("Not found"));

            const res = await request(app)
                .post("/api/payments/checkout-success")
                .set("Cookie", userCookie)
                .send({ sessionId: "invalid_session" });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toContain("Error processing successful checkout");
        });
    });
});