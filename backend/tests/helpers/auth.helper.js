import request from "supertest";
import User from "../../models/user.model.js";

// cria um admin e retorna cookies de autenticação
export async function createAdminAndLogin(app) {
    const email = `admin_${Date.now()}@test.com`;
    const password = "123456";

    // cria usuário direto no banco
    await User.create({
        name: "Admin",
        email,
        password,
        role: "admin",
    });

    // faz login via API
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    return res.headers["set-cookie"];
}

// cria um customer e retorna cookies de autenticação
export async function createCustomerAndLogin(app) {
    const email = `customer_${Date.now()}@test.com`;
    const password = "123456";

    // cria usuário direto no banco
    await User.create({
        name: "Customer",
        email,
        password,
        role: "customer",
    });

    // faz login via API
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    return res.headers["set-cookie"];
}