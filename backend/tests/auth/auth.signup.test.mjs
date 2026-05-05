import request from "supertest";
import app from "../../app.js";
import { connectTestDB, disconnectTestDB } from "../setup.js";
import User from "../../models/user.model.js";
import '../setup.js';
import { describe, expect, jest } from '@jest/globals';
import e from "express";


beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe("Auth endpoints - Signup unit tests", () => {
    // // SIGN UP UNIT TESTS
    // 1. Signup feliz
    it("should signup a new user with default customer", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "123456",
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("email", "test@example.com");
        expect(res.body).toHaveProperty("role", "customer");
    });

    // 2. Signup com email incorreto
    it("should not signup a new user with invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@ex",
                password: "123456",
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
    });

    // 3. Signup com campos faltando
    it("should not signup a new user with missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                email: "test@example.com.br",
                password: "123456",
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
    });

    // 4. Signup com senha muito curta
    it("should not signup a new user with short password", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com.br",
                password: "12345",
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
    });

    // 5. Sign up com email já existente
    it("should not signup a new user with existing email", async () => {
        // cria usuário manualmente
        await User.create({ name: "Existing User", email: "existing@example.com", password: "123456" });

        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "existing@example.com",
                password: "123456",
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
    });

    // 6. Sign up com campo inesperado role
    it("should ignore unexpected fields in signup", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test2@example.com",
                password: "123456",
                role: "admin", // campo inesperado
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("role", "customer");
    });

    // 7. Sign up armazena senha hasheada
    it("should store hashed password in database", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test3@example.com",
                password: "123456",
            });
        expect(res.statusCode).toEqual(201);
        // busca usuário no banco de dados e compara senha em texto
        const user = await User.findById(res.body._id);

        expect(user).not.toBeNull();
        expect(user.password).not.toEqual("123456");
    });
});