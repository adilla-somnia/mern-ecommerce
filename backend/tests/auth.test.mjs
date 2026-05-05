import request from "supertest";
import app from "../app.js";
import { connectTestDB, disconnectTestDB } from "./setup.js";
import User from "../models/user.model.js";
import './setup.js';
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
