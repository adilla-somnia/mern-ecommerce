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
import { createAdminAndLogin } from '../helpers/auth.helper.js';

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});


// INTEGRATION
// CREATE PRODUCT > PATCH > DELETE > GET (404)
describe("Product Integration - POST/PATCH/DELETE/GET", () => {
    // 1. deletar produto
    it("should create, patch, delete a product and not find in with GET", async () => {
        // criar usuário admin e logar para pegar o cookie
        const cookies = await createAdminAndLogin(app)

        // create product
        const product = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product 3",
                description: "Test Product Description",
                price: 100,
                category: "Test Category123123",
                image: "http://example.com/image.jpg"
            })
            .set('Cookie', cookies)
            ;


        expect(product.statusCode).toBe(201)

        const featured = await request(app)
            .patch(`/api/products/${product.body._id}`)
            .set('Cookie', cookies)

        expect(featured.statusCode).toBe(200)

        const deleted = await request(app)
            .delete(`/api/products/${product.body._id}`)
            .set('Cookie', cookies)
            ;

        expect(deleted.statusCode).toEqual(200);

        const notFound = await request(app)
            .get('/api/products/category/Test Category123123')

        expect(notFound.statusCode).toBe(200)
        expect(notFound.body.products.length).toBe(0)

    });

});