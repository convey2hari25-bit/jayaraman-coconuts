const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const db = require("../db");

console.log("AUTH ROUTER FILE LOADED");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// =====================================
// CREATE JWT
// =====================================
function createToken(user) {
  return jwt.sign(
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
}

// =====================================
// AUTH MIDDLEWARE
// =====================================
function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
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

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================
// GOOGLE LOGIN
// =====================================
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
    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Google account email not available",
      });
    }

    // =====================================
    // CHECK EXISTING USER
    // =====================================
    const [existingUsers] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );

    let user;

    // =====================================
    // EXISTING USER
    // =====================================
    if (existingUsers.length > 0) {
      user = existingUsers[0];

      console.log(
        "Existing user login:",
        user.email
      );
    }

    // =====================================
    // NEW USER
    // =====================================
    else {
      // Generate random password because
      // Google users don't need local password
      const randomPassword =
        `${googleId}-${Date.now()}-${Math.random()}`;

      const hashedPassword =
        await bcrypt.hash(
          randomPassword,
          10
        );

      const [result] =
        await db.query(
          `
          INSERT INTO users
          (
            name,
            email,
            password
          )
          VALUES (?, ?, ?)
          `,
          [
            name || "Business Owner",
            email,
            hashedPassword,
          ]
        );

      const [newUsers] =
        await db.query(
          `
          SELECT *
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [result.insertId]
        );

      user = newUsers[0];

      console.log(
        "New user created:",
        user.email
      );
    }

    // =====================================
    // CREATE BIZFLOW JWT
    // =====================================
    const token =
      createToken(user);

    // =====================================
    // RETURN USER
    // =====================================
    return res.status(200).json({
      success: true,

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",

        business_name:
          user.business_name || "",

        business_type:
          user.business_type || "",

        owner_name:
          user.owner_name ||
          user.name ||
          "",

        business_address:
          user.business_address || "",

        currency:
          user.currency || "INR",

        region:
          user.region || "",

        setup_completed:
          Number(
            user.setup_completed || 0
          ),

        picture: picture || "",
      },
    });
  } catch (error) {
    console.error(
      "Google auth error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Google authentication failed",
      error: error.message,
    });
  }
});

// =====================================
// GET CURRENT USER
// =====================================
router.get(
  "/me",
  authenticateUser,
  async (req, res) => {
    try {
      const [users] =
        await db.query(
          `
          SELECT *
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [req.user.id]
        );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = users[0];

      return res.status(200).json({
        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",

          business_name:
            user.business_name || "",

          business_type:
            user.business_type || "",

          owner_name:
            user.owner_name ||
            user.name ||
            "",

          business_address:
            user.business_address || "",

          currency:
            user.currency || "INR",

          region:
            user.region || "",

          setup_completed:
            Number(
              user.setup_completed || 0
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch user",
      });
    }
  }
);

// =====================================
// UPDATE BUSINESS PROFILE / SETUP
// =====================================
router.put(
  "/profile",
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        business_name,
        business_type,
        owner_name,
        phone,
        business_address,
        currency,
        region,
      } = req.body;

      // Validation
      if (
        !business_name ||
        !business_name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Business name is required",
        });
      }

      if (
        !business_type ||
        !business_type.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Business type is required",
        });
      }

      // =====================================
      // UPDATE USER BUSINESS DETAILS
      // =====================================
      await db.query(
        `
        UPDATE users
        SET
          business_name = ?,
          business_type = ?,
          owner_name = ?,
          phone = ?,
          business_address = ?,
          currency = ?,
          region = ?,
          setup_completed = 1
        WHERE id = ?
        `,
        [
          business_name.trim(),
          business_type.trim(),
          owner_name
            ? owner_name.trim()
            : "",
          phone
            ? phone.trim()
            : "",
          business_address
            ? business_address.trim()
            : "",
          currency || "INR",
          region
            ? region.trim()
            : "",
          userId,
        ]
      );

      // =====================================
      // GET UPDATED USER
      // =====================================
      const [users] =
        await db.query(
          `
          SELECT *
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [userId]
        );

      const user = users[0];

      return res.status(200).json({
        success: true,
        message:
          "Business setup completed successfully",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",

          business_name:
            user.business_name || "",

          business_type:
            user.business_type || "",

          owner_name:
            user.owner_name ||
            user.name ||
            "",

          business_address:
            user.business_address || "",

          currency:
            user.currency || "INR",

          region:
            user.region || "",

          setup_completed:
            Number(
              user.setup_completed || 0
            ),
        },
      });
    } catch (error) {
      console.error(
        "Business profile update error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to save business setup",
        error: error.message,
      });
    }
  }
);

// =====================================
// EXPORT
// =====================================
module.exports = router;