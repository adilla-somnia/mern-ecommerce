import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";

dotenv.config({ path: "../../.env" });

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@teste.com" });
    if (!adminExists) {
      const admin = await User.create({
        name: "Admin",
        email: "admin@teste.com",
        password: process.env.ADMIN_PASSWORD || "admin123",
        role: "admin",
      });
      console.log("Admin created:", admin);
    } else {
      console.log("Admin already exists");
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();