import request from "supertest";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, redis } from "./setup.js";
import User from "../models/user.model.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Auth endpoints", () => {
  it("should signup a new user", async () => {
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
  });

  it("should login an existing user", async () => {
    // cria usuário manualmente
    await User.create({ name: "Login User", email: "login@example.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "123456",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("email", "login@example.com");
  });
});