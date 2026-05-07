// backend/tests/coupon.controller.test.mjs
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { connectTestDB, disconnectTestDB } from "../setup.js";
import User from "../../models/user.model.js";
import Coupon from "../../models/coupon.model.js";

await jest.unstable_mockModule("../../lib/stripe.js", () => ({
    stripe: {
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

describe("Coupon Controller", () => {
    let adminCookie;
    let customerCookie;
    let coupon;

    beforeAll(async () => {
        // criar admin
        const adminUser = await User.create({
            name: "Admin",
            email: "admin@example.com",
            password: "123456",
            role: "admin",
        });
        const loginResAdmin = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@example.com", password: "123456" });
        adminCookie = loginResAdmin.headers["set-cookie"];

        // criar customer
        const customerUser = await User.create({
            name: "Customer",
            email: "customer@example.com",
            password: "123456",
            role: "customer",
        });
        const loginResCustomer = await request(app)
            .post("/api/auth/login")
            .send({ email: "customer@example.com", password: "123456" });
        customerCookie = loginResCustomer.headers["set-cookie"];

        // criar coupon para o customer
        coupon = await Coupon.create({
            code: "TEST10",
            discountPercentage: 10,
            isActive: true,
            userId: customerUser._id,
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        expired_coupon = await Coupon.create({
            code: "TEST101",
            discountPercentage: 10,
            isActive: true,
            userId: adminUser._id,
            expirationDate: new Date(Date.now() - 200),
        });

    });

    describe("GET /api/coupon", () => {
        it("should return user's coupons", async () => {
            const res = await request(app)
                .get("/api/coupons")
                .set("Cookie", customerCookie);


            expect(res.statusCode).toBe(200);
            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty("_id");
            expect(res.body.code).toBe("TEST10");
        });

        it("should fail if user is not authenticated", async () => {
            const res = await request(app).get("/api/coupons");
            expect(res.statusCode).toBe(401);
        });
    });

    describe("POST /api/coupon/validate", () => {
        it("should validate a correct coupon", async () => {
            const res = await request(app)
                .post("/api/coupons/validate")
                .send({ code: "TEST10" })
                .set("Cookie", customerCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Coupon is valid");
            expect(res.body.discountPercentage).toBe(10);
        });

        it("should reject an invalid coupon", async () => {
            const res = await request(app)
                .post("/api/coupons/validate")
                .send({ code: "INVALID" })
                .set("Cookie", customerCookie);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Coupon not found');
        });

        it("should reject a coupon from another user", async () => {
            const res = await request(app)
                .post("/api/coupons/validate")
                .send({ code: "TEST10" })
                .set("Cookie", adminCookie); // admin is not the owner

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Coupon not found');
        });

        it("should fail if user is not authenticated", async () => {
            const res = await request(app)
                .post("/api/coupons/validate")
                .send({ code: "TEST10" });

            expect(res.statusCode).toBe(401);
        });

        it("should reject an expired coupon", async () => {
            const res = await request(app)
                .post("/api/coupons/validate")
                .send({ code: "TEST101" })
                .set("Cookie", adminCookie); // admin is not the owner

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Coupon expired');
        });
    });
});