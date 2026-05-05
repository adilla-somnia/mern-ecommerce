import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { connectTestDB, disconnectTestDB } from "../setup.js";
import User from "../../models/user.model.js";
import Product from "../../models/product.model.js";

import { default as app } from "../../app.js";

let userCookie;
let product;

beforeAll(async () => {
    await connectTestDB();

    const user = await User.create({
        name: "User",
        email: "user@example.com",
        password: "123456",
        role: "customer",
    });

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
});

afterAll(async () => {
    await disconnectTestDB();
});

describe("Cart Controller", () => {

    describe("GET /api/cart", () => {
        it("should return empty cart initially", async () => {
            const res = await request(app)
                .get("/api/cart")
                .set("Cookie", userCookie);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    describe("POST /api/cart", () => {
        it("should fail if productId is missing", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Cookie", userCookie)
                .send({ quantity: 1 });

            expect(res.statusCode).toBe(400);
        });

        it("should add a product to the cart", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Cookie", userCookie)
                .send({ productId: product._id });


            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].quantity).toBe(1);
        });
    });

    describe("PUT /api/cart/:id", () => {
        it("should update product quantity in the cart", async () => {
            const cart = await request(app)
                .get("/api/cart")
                .set("Cookie", userCookie);

            const cartItemId = cart.body[0]._id;

            const res = await request(app)
                .put(`/api/cart/${cartItemId}`)
                .set("Cookie", userCookie)
                .send({ quantity: 5 });

            expect(res.statusCode).toBe(200);
            expect(res.body[0].quantity).toBe(5);
        });

        it("should fail with invalid product id", async () => {
            const res = await request(app)
                .put(`/api/cart/invalidid`)
                .set("Cookie", userCookie)
                .send({ quantity: 3 });

            expect(res.statusCode).toBe(404);
        });
    });

    describe("DELETE /api/cart", () => {
        it("should remove all items from the cart", async () => {
            const res = await request(app)
                .delete("/api/cart")
                .set("Cookie", userCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });
    });
});