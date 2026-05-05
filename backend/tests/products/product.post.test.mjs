import { describe, expect, jest } from '@jest/globals';

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


const { default: app } = await import("../../app.js");
import request from "supertest";
import { connectTestDB, disconnectTestDB } from "../setup.js";
import User from "../../models/user.model.js";
import Product from "../../models/product.model.js";
import e from "express";

import '../../tests/setup.js';
import { createAdminAndLogin, createCustomerAndLogin } from '../helpers/auth.helper.js';

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});


describe("Product endpoints - POST", () => {
    // // PRODUCT UNIT TESTS
    // 1. criar produto com sucesso (admin)
    it("should create a new product as an admin", async () => {
        const cookies = await createAdminAndLogin(app)

        const res = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                description: "Test Product Description",
                price: 100,
                category: "Test Category",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" // base64 string fake
            })
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("price", 100);
        expect(res.body).toHaveProperty("category", "Test Category");
        expect(res.body).toHaveProperty("image", "http://example.com/image.jpg");
        expect(res.body).toHaveProperty("isFeatured", false);
    });

    // 2. criar produto sem ser admin (deve falhar)
    it("should fail to create a product as a non-admin", async () => {
        // criar usuário normal e logar para pegar o cookie
        const cookies = await createCustomerAndLogin(app)

        const res = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                description: "Test Product Description",
                price: 100,
                category: "Test Category",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" // base64 string fake
            })
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(403);
    });

    // 3. criar produto com dados faltando (deve falhar)
    it("should fail to create a product with missing fields", async () => {
        const cookies = await createAdminAndLogin(app)

        const res = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                description: "",
                category: "Test Category",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" // base64 string fake
            })
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(400);
    });

    // 4. produto com preço negativo (deve falhar)
    it("should fail to create a product with negative price", async () => {
        const cookies = await createAdminAndLogin(app)

        const res = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                description: "Test Product Description",
                price: -100,
                category: "Test Category",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" // base64 string fake
            })
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(400);
    });

    // 5. criar produto com tipo de dado errado (deve falhar)
    it("should fail to create a product with invalid data types", async () => {
        const cookies = await createAdminAndLogin(app)

        const res = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                description: "Test Product Description",
                price: "not_a_number", // invalid data type
                category: "Test Category",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" // base64 string fake
            })
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(400);
    });
});
