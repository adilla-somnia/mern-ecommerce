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


describe("Auth endpoints - Login unit tests", () => {
    // // LOGIN UNIT TESTS
    // 1. Login feliz
    it("should login an existing user and set authentication cookies", async () => {
        // cria usuário manualmente
        await User.create({ name: "Login User", email: "login@example.com", password: "123456" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "123456",
            });
        const cookies = res.headers['set-cookie'];

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("email", "login@example.com");
        expect(cookies).toBeDefined();
    });

    // 2. Login com senha incorreta
    it("should not login with incorrect password", async () => {
        // cria usuário manualmente
        await User.create({ name: "Login User2", email: "login2@example.com", password: "123456" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login2@example.com",
                password: "wrongpassword",
            });

        expect(res.statusCode).toEqual(400 || 401);
        expect(res.body).toHaveProperty("error");
    });

    // 3. Login com email não existente
    it("should not login with non-existing email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "123456",
            });

        expect(res.statusCode).toEqual(400 || 401 || 404);
        expect(res.body).toHaveProperty("error");
    });

    // 4. Login com campos faltando
    it("should not login with missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com"
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
    });
});