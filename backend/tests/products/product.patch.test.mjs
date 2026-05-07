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


// FEATURE PRODUCT UNIT TESTS PATCH
describe("Product endpoints - PATCH", () => {
    // 1. marcar produto como destaque (featured) com sucesso (admin)
    it("should mark a product as featured", async () => {
        const cookies = await createAdminAndLogin(app)

        // criar produto para testar
        const product = await Product.create({
            name: "Test Product 2",
            description: "Test Product Description",
            price: 100,
            category: "Test Category",
            image: "http://example.com/image.jpg"
        });

        const res = await request(app)
            .patch(`/api/products/${product._id}`)
            .set("Cookie", cookies)
            ;

        // desmarcar
        const res2 = await request(app)
            .patch(`/api/products/${product._id}`)
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("isFeatured", true);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toHaveProperty("isFeatured", false);
    });

    // 2. marcar produto como destaque sem ser admin (deve falhar)
    it("should fail to mark a product as featured if user is not admin", async () => {
        // criar usuário normal e logar para pegar o cookie
        const cookies = await createCustomerAndLogin(app)

        // criar produto para testar
        const product = await Product.create({
            name: "Test Product 2",
            description: "Test Product Description",
            price: 100,
            category: "Test Category",
            image: "http://example.com/image.jpg"
        });

        const res = await request(app)
            .patch(`/api/products/${product._id}`)
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(403);
    });

    // 3. marcar produto como destaque com id inválido (deve falhar)
    it("should fail to mark a product as featured with invalid id", async () => {
        const cookies = await createAdminAndLogin(app)

        // tentar marcar produto como destaque com id inválido
        const res = await request(app)
            .patch("/api/products/214214123")
            .set("Cookie", cookies)
            ;

        expect(res.statusCode).toEqual(400);
    });

    // 4. marcar produto como destaque sem id (deve falhar)
    it("should fail to mark a product as featured without an id", async () => {
        const cookies = await createAdminAndLogin(app)

        // tentar marcar produto como destaque com id inválido
        const res = await request(app)
            .patch("/api/products/")
            .set("Cookie", cookies)
            ;


        expect(res.statusCode).toEqual(404);
    });

    // 5. marcar produto como destaque com id não encontrado (deve falhar)
    it("should fail to mark a product as featured if it doesn't exist", async () => {
        const cookies = await createAdminAndLogin(app)

        // tentar marcar produto como destaque com id inválido
        const res = await request(app)
            .patch(`/api/products/64b8f3c2a1d4e5f6789abcde`)
            .set("Cookie", cookies)
            ;



        expect(res.statusCode).toEqual(404);
    });

});