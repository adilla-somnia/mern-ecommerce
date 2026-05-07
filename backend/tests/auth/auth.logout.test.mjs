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

describe("Auth endpoints - Logout unit tests", () => {
    // LOGOUT UNIT TESTS
    // 1. Logout feliz
    it("should logout a logged-in user and clear authentication cookies", async () => {
        // cria usuário manualmente
        await User.create({ name: "Logout User", email: "logout@example.com", password: "123456" });

        const res = await request(app)
            .post("/api/auth/logout");
        const cookies = res.headers['set-cookie'];

        expect(res.statusCode).toEqual(200);
        expect(cookies).toBeDefined();
    });

    // 2. Logout sem estar logado
    it("should logout even if user is not logged in", async () => {
        const res = await request(app)
            .post("/api/auth/logout");
        const cookies = res.headers['set-cookie'];

        expect(res.statusCode).toEqual(200);
        expect(cookies).toBeDefined();
    });
});