

// ========================
// MOCK STRIPE
// ========================
const mockStripe = {
    checkout: {
        sessions: {
            create: jest.fn().mockResolvedValue({
                id: "sess_test_123",
                amount_total: 10000,
                payment_status: "paid",
                metadata: {
                    userId: "user_1",
                    couponCode: "",
                    products: JSON.stringify([]),
                },
            }),
        },
    },
    coupons: {
        create: jest.fn().mockResolvedValue({
            id: "coupon_test_123",
        }),
    },
};

// mock do módulo stripe usado no projeto
jest.unstable_mockModule("../../lib/stripe.js", () => ({
    stripe: mockStripe,
}));

import request from "supertest";
const { default: app } = await import("../../app.js");
import User from "../../models/user.model.js";
import Coupon from "../../models/coupon.model.js";
import { connectTestDB, disconnectTestDB } from "../setup.js";
import { describe, expect, jest, beforeAll, afterAll } from "@jest/globals";
import { createAdminAndLogin } from "../helpers/auth.helper.js";

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe("Coupon integration via Payment", () => {
    it("should apply valid coupon and send discount to Stripe session", async () => {
        const cookies = await createAdminAndLogin(app);

        const user = await User.findOne({ role: "admin" });

        // cria cupom válido para o usuário
        await Coupon.create({
            code: "TEST10",
            discountPercentage: 10,
            isActive: true,
            userId: user._id,
            expirationDate: new Date(Date.now() + 1000000),
        });

        const res = await request(app)
            .post("/api/payments/create-checkout-session")
            .set("Cookie", cookies)
            .send({
                products: [
                    {
                        _id: "prod_1",
                        name: "Produto Teste",
                        price: 100,
                        quantity: 1,
                        image: "img",
                    },
                ],
                couponCode: "TEST10",
            });

        expect(res.statusCode).toBe(200);

        // 🔥 valida chamada no Stripe
        const stripeCall =
            mockStripe.checkout.sessions.create.mock.calls[0][0];

        console.log(mockStripe.checkout.sessions.create.mock.calls);

        expect(stripeCall.discounts).toBeDefined();
        expect(stripeCall.discounts.length).toBe(1);
        expect(stripeCall.discounts[0]).toHaveProperty(
            "coupon",
            "coupon_test_123"
        );
    });

    it("should not apply discount when coupon is invalid", async () => {
        const cookies = await createAdminAndLogin(app);

        const res = await request(app)
            .post("/api/payments/create-checkout-session")
            .set("Cookie", cookies)
            .send({
                products: [
                    {
                        _id: "prod_1",
                        name: "Produto Teste",
                        price: 100,
                        quantity: 1,
                        image: "img",
                    },
                ],
                couponCode: "INVALID_CODE",
            });

        expect(res.statusCode).toBe(200);

        const stripeCall =
            mockStripe.checkout.sessions.create.mock.calls[1][0];

        expect(stripeCall.discounts).toEqual([]);
    });
});