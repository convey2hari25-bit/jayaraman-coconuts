const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const db = require("../db");

// ===============================
// GOOGLE CLIENT
// ===============================
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ===============================
// TEST AUTH ROUTE
// ===============================
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth router is working",
  });
});

// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, phone)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, phone || null]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: result.insertId,
        name,
        email,
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// ===============================
// GOOGLE LOGIN
// ===============================
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    // Check whether user already exists
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (users.length > 0) {
      // Existing user
      user = users[0];
    } else {
      // New Google user
      //
      // Existing users table requires password,
      // so generate a random hash for Google accounts.
      const randomPassword = `${googleId}-${Date.now()}-${Math.random()}`;
      const hashedPassword = await bcrypt.hash(
        randomPassword,
        12
      );

      const [result] = await db.query(
        `INSERT INTO users
         (name, email, password, phone)
         VALUES (?, ?, ?, ?)`,
        [
          name || "Google User",
          email,
          hashedPassword,
          null,
        ]
      );

      user = {
        id: result.insertId,
        name: name || "Google User",
        email,
        phone: null,
      };
    }

    // Create BizFlow JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        picture: picture || null,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    res.status(401).json({
      success: false,
      message: "Google authentication failed",
      error: error.message,
    });
  }
});

// ===============================
// GET CURRENT USER
// ===============================
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const [users] = await db.query(
      `SELECT id, name, email, phone, created_at
       FROM users
       WHERE id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Auth verification error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

// ===============================
// EXPORT ROUTER
// ===============================
module.exports = router;