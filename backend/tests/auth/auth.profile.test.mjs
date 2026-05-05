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


describe("Auth endpoints - Profile", () => {
    // PROFILE UNIT TESTS
    // 1. Acessar perfil com token válido e sem senha no response
    it("should access profile with valid token", async () => {
        // cria usuário manualmente
        const user = await User.create({ name: "Profile User", email: "profile@example.com", password: "123456" });

        // faz login para obter token
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "profile@example.com",
                password: "123456"
            });

        const cookies = loginRes.headers['set-cookie'];
        const res = await request(app)
            .get("/api/auth/profile")
            .set('Cookie', cookies);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("email", "profile@example.com");
        expect(res.body).not.toHaveProperty("password");
        expect(res.body).toHaveProperty("name", "Profile User");

    });

    // 2. Acessar perfil com token inválido
    it("should not access profile with invalid token", async () => {
        const res = await request(app)
            .get("/api/auth/profile")
            .set('Cookie', ['accessToken=invalidtoken']);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("error");
    });

    // 3. Acessar perfil sem token
    it("should not access profile without token", async () => {
        const res = await request(app)
            .get("/api/auth/profile");

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("error");
    });
});