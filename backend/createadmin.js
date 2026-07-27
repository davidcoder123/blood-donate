require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.create({
    name: "Admin",
    email: "admin@blooddonor.com",
    password: "12345678",
    role: "admin",
    status: "active",
    emailVerified: true,
  });

  console.log("Admin created:", admin.email);
  process.exit();
}

createAdmin().catch(console.error);
