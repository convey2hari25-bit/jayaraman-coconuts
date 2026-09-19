const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = require("../db");

// =====================================
// AUTHENTICATION HELPER
// =====================================
function authenticateUser(req, res, next) {
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
// GET ALL CUSTOMERS
// Only logged-in user's customers
// =====================================
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [customers] = await db.query(
      `
      SELECT *
      FROM customers
      WHERE user_id = ?
        AND deleted = 0
      ORDER BY id DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

// =====================================
// GET CUSTOMER BY ID
// =====================================
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [customers] = await db.query(
      `
      SELECT *
      FROM customers
      WHERE id = ?
        AND user_id = ?
        AND deleted = 0
      `,
      [id, userId]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customers[0],
    });
  } catch (error) {
    console.error(
      "Get customer error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
});

// =====================================
// ADD CUSTOMER
// =====================================
router.post("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO customers
      (
        user_id,
        name,
        phone,
        address,
        deleted
      )
      VALUES (?, ?, ?, ?, 0)
      `,
      [
        userId,
        name,
        phone,
        address || "",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer: {
        id: result.insertId,
        user_id: userId,
        name,
        phone,
        address: address || "",
        deleted: 0,
      },
    });
  } catch (error) {
    console.error(
      "Add customer error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to add customer",
      error: error.message,
    });
  }
});

// =====================================
// UPDATE CUSTOMER
// =====================================
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      name,
      phone,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const [result] = await db.query(
      `
      UPDATE customers
      SET
        name = ?,
        phone = ?,
        address = ?
      WHERE id = ?
        AND user_id = ?
        AND deleted = 0
      `,
      [
        name,
        phone,
        address || "",
        id,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found or does not belong to this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error(
      "Update customer error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
});

// =====================================
// DELETE CUSTOMER
// Soft delete
// =====================================
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check customer belongs to this user
    const [customers] = await db.query(
      `
      SELECT id
      FROM customers
      WHERE id = ?
        AND user_id = ?
        AND deleted = 0
      `,
      [id, userId]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check active sales belonging to same user
    const [sales] = await db.query(
      `
      SELECT sales.id
      FROM sales
      INNER JOIN customers
        ON sales.customer_id = customers.id
      WHERE sales.customer_id = ?
        AND sales.deleted = 0
        AND sales.user_id = ?
      LIMIT 1
      `,
      [id, userId]
    );

    if (sales.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Customer cannot be deleted because active sales history exists",
      });
    }

    // Soft delete
    const [result] = await db.query(
      `
      UPDATE customers
      SET deleted = 1
      WHERE id = ?
        AND user_id = ?
        AND deleted = 0
      `,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete customer error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
});

module.exports = router;