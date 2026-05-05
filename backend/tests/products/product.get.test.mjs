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


// PRODUCT UNIT TESTS GET
describe("Product endpoints - GET", () => {
    // 1. pegar todos os produtos (admin)
    it("should get all products for admin", async () => {
        // login
        const cookies = await createAdminAndLogin(app)

        const res = await request(app)
            .get("/api/products/")
            .set('Cookie', cookies)
            ;

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.products)).toBe(true);
    });


    // 2. pegar todos os produtos sendo customer (deve falhar)
    it("should not get all products when user is a customer", async () => {
        // login
        const cookies = await createCustomerAndLogin(app)

        const res = await request(app)
            .get("/api/products/")
            .set('Cookie', cookies)
            ;

        expect(res.statusCode).toEqual(403);
    });

});

// PRODUCT UNIT TESTS GET
describe("Product endpoints - GET featured", () => {
    // 1. pegar produtos em destaque (featured), vazio
    it("should get featured products when it's empty", async () => {
        const res = await request(app)
            .get("/api/products/featured")
            ;

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0)
    });


    // 2. pegar produtos featured com itens
    it("should get featured products when there are itens", async () => {
        // criando produtos para teste 3 e 4
        const product1 = await Product.create({
            name: "Test Product 2",
            description: "Test Product Description",
            price: 100,
            category: "Test Category13",
            image: "http://example.com/image.jpg",
            isFeatured: true
        },
            {
                name: "Test Product 3",
                description: "Test Product Description",
                price: 100,
                category: "Test Category13",
                image: "http://example.com/image.jpg",
                isFeatured: true
            });

        const res = await request(app)
            .get("/api/products/featured")
            ;

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length === 2);
    });

});

// PRODUCT UNIT TESTS GET
describe("Product endpoints - GET category", () => {
    // 1. pegar produtos por categoria vazia
    it("should get products by category when it's empty", async () => {
        const res = await request(app)
            .get("/api/products/category/Test Category000")
            ;

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.products)).toBe(true);
        expect(res.body.products.length).toBe(0)
    });

    // 2. pegar produtos por categoria com itens (produtos são criados no teste acima)
    it("should get products by category", async () => {
        const res = await request(app)
            .get("/api/products/category/Test Category13")
            ;

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.products)).toBe(true);
        expect(res.body.products.length).toBe(2)
    });

});


// PRODUCTS GET RECOMMENDEDATIONS
describe("Product endpoints - GET Recommendations", () => {
    // 1. pegar produtos em destaque (featured), vazio
    it("should get recommended products of length 4", async () => {
        await Product.create(
            {
                name: 'Test Product 2',
                description: 'Test Product Description',
                price: 100,
                image: 'http://example.com/image.jpg',
                category: 'Test Category'
            },
            {
                name: 'Test Product 2',
                description: 'Test Product Description',
                price: 100,
                image: 'http://example.com/image.jpg',
                category: 'Test Category'
            },
            {
                name: 'Test Product 2',
                description: 'Test Product Description',
                price: 100,
                image: 'http://example.com/image.jpg',
                category: 'Test Category'
            },
            {
                name: 'Test Product 2',
                description: 'Test Product Description',
                price: 100,
                image: 'http://example.com/image.jpg',
                category: 'Test Category'
            },
        )

        const res = await request(app)
            .get("/api/products/recommendations")
            ;

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(4)
    });

});
