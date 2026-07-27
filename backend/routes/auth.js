const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { sendOTP, sendPasswordReset } = require("../utils/email");

// ── Rate limiters (security) ──────────────────────────────────
// Max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many login attempts. Try again after 15 minutes." },
});

// Max 3 OTP requests per hour per IP
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { error: "Too many OTP requests. Try again after 1 hour." },
});

// Helper: generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Helper: generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── SEND OTP (step 1 of donor registration) ──────────────────
router.post(
  "/send-otp",
  otpLimiter,
  [
    body("email")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { email } = req.body;

      // Check if email already registered
      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ error: "Email already registered. Please login." });

      // Generate OTP and save temporarily
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in a temporary user doc (or update if resending)
      await User.findOneAndUpdate(
        { email, role: "pending_otp" }, // temp marker
        {
          email,
          otp,
          otpExpiry,
          role: "donor",
          status: "pending",
          name: "temp",
        },
        { upsert: true, new: true },
      );

      await sendOTP(email, otp);
      res.json({ message: "OTP sent to your email. Valid for 10 minutes." });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Failed to send OTP. Check your email and try again." });
    }
  },
);

// ── REGISTER DONOR (step 2 - after OTP) ──────────────────────
router.post(
  "/register/donor",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("bloodGroup").notEmpty().withMessage("Blood group is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("city").notEmpty().withMessage("City is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const {
        name,
        email,
        password,
        otp,
        bloodGroup,
        phone,
        address,
        city,
        state,
        latitude,
        longitude,
      } = req.body;
      // Find temp user with OTP
      const tempUser = await User.findOne({ email }).select("+otp +otpExpiry");
      if (!tempUser || !tempUser.otp)
        return res
          .status(400)
          .json({ error: "No OTP found. Please request a new OTP." });
      if (tempUser.otpExpiry < new Date())
        return res
          .status(400)
          .json({ error: "OTP expired. Please request a new one." });
      if (tempUser.otp !== otp)
        return res
          .status(400)
          .json({ error: "Incorrect OTP. Please try again." });

      // Update user with full details
      tempUser.name = name;
      tempUser.password = password;
      tempUser.role = "donor";
      tempUser.status = "active";
      tempUser.bloodGroup = bloodGroup;
      tempUser.phone = phone;
      tempUser.city = city;
      tempUser.state = state;
      tempUser.address = address;
      tempUser.emailVerified = true;
      tempUser.otp = undefined;
      tempUser.otpExpiry = undefined;
      if (latitude && longitude) {
        tempUser.location = {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        };
      }
      await tempUser.save();

      const token = generateToken(tempUser._id);
      res.status(201).json({ token, user: tempUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  },
);

// ── REGISTER HOSPITAL ─────────────────────────────────────────
router.post(
  "/register/hospital",
  [
    body("name").trim().notEmpty().withMessage("Contact name required"),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password min 6 characters"),
    body("hospitalName").notEmpty().withMessage("Hospital name required"),
    body("licenseNumber").notEmpty().withMessage("License number required"),
    body("phone").notEmpty().withMessage("Phone required"),
    body("city").notEmpty().withMessage("City required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const {
        name,
        email,
        password,
        hospitalName,
        licenseNumber,
        phone,
        address,
        city,
        state,
        latitude,
        longitude,
      } = req.body;

      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ error: "Email already registered." });

      const hospital = await User.create({
        name,
        email,
        password,
        role: "hospital",
        status: "pending", // Must wait for admin approval
        hospitalName,
        licenseNumber,
        phone,
        city,
        state,
        address,
        location:
          latitude && longitude
            ? {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              }
            : undefined,
      });

      res.status(201).json({
        message:
          "Registration submitted. You will receive an email once approved by admin.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  },
);

// ── LOGIN ─────────────────────────────────────────────────────
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { email, password } = req.body;

      // Get user WITH password (select: false by default)
      const user = await User.findOne({ email }).select("+password");
      if (!user)
        return res.status(401).json({ error: "Invalid email or password." }); // Same message for security

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ error: "Invalid email or password." });

      if (user.status === "pending")
        return res
          .status(403)
          .json({ error: "Account pending admin approval. Check your email." });
      if (user.status === "rejected")
        return res
          .status(403)
          .json({ error: "Account was rejected. Contact support." });

      const token = generateToken(user._id);
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ error: "Login failed. Please try again." });
    }
  },
);

// ── FORGOT PASSWORD ───────────────────────────────────────────
router.post(
  "/forgot-password",
  otpLimiter,
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      // Always return success (don't reveal if email exists - security best practice)
      if (!user)
        return res.json({
          message: "If that email exists, a reset link has been sent.",
        });

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await sendPasswordReset(user.email, resetUrl);

      res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to send reset email." });
    }
  },
);

// ── RESET PASSWORD ────────────────────────────────────────────
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password min 6 characters"),
  ],
  async (req, res) => {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
      const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: Date.now() },
      }).select("+resetToken +resetTokenExpiry");

      if (!user)
        return res
          .status(400)
          .json({ error: "Reset link is invalid or expired." });

      user.password = req.body.password;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: "Password reset successful. Please login." });
    } catch (err) {
      res.status(500).json({ error: "Password reset failed." });
    }
  },
);

module.exports = router;
