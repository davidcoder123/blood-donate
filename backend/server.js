require("dotenv").config();
const cron = require("node-cron");
const BloodRequest = require("./models/BloodRequest");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");
const hospitalRoutes = require("./routes/hospital");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notification");

const app = express();
const httpServer = createServer(app);

// Socket.io for real-time notifications
// const io = new Server(httpServer, {
//   cors: { origin: process.env.CLIENT_URL, credentials: true },
// });

const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  },
});

// Store connected users: { userId: socketId }
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    console.log("User registered:", userId);
    connectedUsers[userId] = socket.id;
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
  });
  socket.on("disconnect", () => {
    Object.keys(connectedUsers).forEach((uid) => {
      if (connectedUsers[uid] === socket.id) delete connectedUsers[uid];
    });
  });
});

// Make io and connectedUsers available in routes
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// ── Security middleware ──────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
//app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks

// ── Database ─────────────────────────────────────────────────
console.log("MONGO_URI =", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Blood Donor API running" }));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});
// Run every 10 minutes — expire old open requests
cron.schedule("*/10 * * * *", async () => {
  try {
    const result = await BloodRequest.updateMany(
      { status: "open", expiresAt: { $lt: new Date() } },
      { status: "expired" },
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired ${result.modifiedCount} blood request(s)`);
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
