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


// TESTE UNITARIO DE ROLE ACCESS
describe("Auth endpoints - Admin access control", () => {
    // 1. Acessar rota admin com usuário admin
    it("should allow access to admin route for admin user", async () => {
        // cria usuário admin manualmente
        await User.create({ name: "Admin User", email: "admin@example.com", password: "123456", role: "admin" });

        // faz login para obter token
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "admin@example.com",
                password: "123456"
            });

        const cookies = loginRes.headers['set-cookie'];
        const res = await request(app)
            .get("/api/analytics/") // rota protegida admin
            .set('Cookie', cookies);

        expect(res.statusCode).toEqual(200);
    });

    // 2. Barrar acesso a rota admin para usuário comum
    it("should deny access to admin route for non-admin user", async () => {
        // cria usuário comum manualmente
        await User.create({ name: "Regular User", email: "regular@example.com", password: "123456", role: "customer" });

        // faz login para obter token
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "regular@example.com",
                password: "123456"
            });

        const cookies = loginRes.headers['set-cookie'];
        const res = await request(app)
            .get("/api/analytics/") // rota protegida admin
            .set('Cookie', cookies);

        expect(res.statusCode).toEqual(403);
    });
});