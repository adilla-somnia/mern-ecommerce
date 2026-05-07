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


// TESTES DE INTEGRAÇÃO
describe("Auth endpoints - Integration tests", () => {
    // 1. Signup, login e acessar perfil
    it("should signup, login, access profile and logout", async () => {
        // Signup
        const signupRes = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Integration User",
                email: "integration@example.com",
                password: "123456"
            });
        expect(signupRes.statusCode).toEqual(201);

        // Login
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "integration@example.com",
                password: "123456"
            });
        expect(loginRes.statusCode).toEqual(200);

        // Access profile
        const profileRes = await request(app)
            .get("/api/auth/profile")
            .set('Cookie', loginRes.headers['set-cookie']);
        expect(profileRes.statusCode).toEqual(200);

        // Logout
        const logoutRes = await request(app)
            .post("/api/auth/logout")
            .set('Cookie', loginRes.headers['set-cookie']);
        expect(logoutRes.statusCode).toEqual(200);


    });

    // 2. Sign up duplicado, login com do usuário criado primeiro funciona
    it("should not allow duplicate signup but allow login with original user", async () => {
        // Signup original user
        const signupRes1 = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Original User",
                email: "original@example.com",
                password: "123456"
            });
        expect(signupRes1.statusCode).toEqual(201);

        // Tentativa de signup com mesmo email
        const signupRes2 = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Duplicate User",
                email: "original@example.com",
                password: "654321"
            });
        expect(signupRes2.statusCode).toEqual(400);

        // Login com usuário original
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "original@example.com",
                password: "123456"
            });
        expect(loginRes.statusCode).toEqual(200);
    });

});
