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


// PRODUCT UNIT TESTS DELETE
describe("Product endpoints - DELETE", () => {
    // 1. deletar produto
    it("should delete an existing product", async () => {
        // criar usuário admin e logar para pegar o cookie
        const cookies = await createAdminAndLogin(app);

        // create product
        const product = await Product.create({
            name: "Test Product 3",
            description: "Test Product Description",
            price: 100,
            category: "Test Category",
            image: "http://example.com/image.jpg"
        });
        const res = await request(app)
            .delete(`/api/products/${product.id}`)
            .set('Cookie', cookies)
            ;

        expect(res.statusCode).toEqual(200);

    });

    // 2. deletar produto por customer
    it("should not let customers delete products ", async () => {
        // criar usuário customer e logar para pegar o cookie
        const cookies = await createCustomerAndLogin(app);

        // create product
        const product = await Product.create({
            name: "Test Product 4",
            description: "Test Product Description",
            price: 100,
            category: "Test Category",
            image: "http://example.com/image.jpg"
        });
        const res = await request(app)
            .delete(`/api/products/${product.id}`)
            .set('Cookie', cookies)
            ;

        expect(res.statusCode).toEqual(403);
    });

    // 3. deletar produto inexistente (deve falhar)
    it("should not delete a non existing product", async () => {
        const cookies = await createAdminAndLogin(app);

        const res = await request(app)
            .delete('/api/products/64b8f3c2a1d4e5f6789abcde')
            .set('Cookie', cookies)
            ;

        expect(res.statusCode).toEqual(404);
    });

    // 4. deletar produto com _id undefined (deve falhar)
    it("should not delete an undefined product id", async () => {
        const cookies = await createAdminAndLogin(app);

        const res = await request(app)
            .delete(`/api/products/${undefined}`)
            .set('Cookie', cookies)
            ;

        expect(res.statusCode).toEqual(400);
    });

});