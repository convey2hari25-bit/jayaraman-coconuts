const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = require("../db");

// =====================================
// AUTHENTICATION
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
// GET ALL ACTIVE STOCKS
// =====================================
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT *
      FROM stocks
      WHERE user_id = ?
        AND deleted = 0
      ORDER BY id DESC
      `,
      [userId]
    );

    const formattedStocks = rows.map((stock) => ({
      id: stock.id,
      type: stock.type,
      quantity: stock.quantity,
      purchasePrice: stock.purchase_price,
      sellingPrice: stock.selling_price,
      createdAt: stock.created_at,
    }));

    res.status(200).json({
      success: true,
      data: formattedStocks,
    });
  } catch (error) {
    console.error("Get stocks error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stocks",
      error: error.message,
    });
  }
});

// =====================================
// ADD STOCK
// =====================================
router.post("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      type,
      quantity,
      purchasePrice,
      sellingPrice,
    } = req.body;

    if (
      !type ||
      quantity === undefined ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Type, quantity, purchase price and selling price are required",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO stocks
      (
        user_id,
        type,
        quantity,
        purchase_price,
        selling_price,
        deleted
      )
      VALUES (?, ?, ?, ?, ?, 0)
      `,
      [
        userId,
        type,
        quantity,
        purchasePrice,
        sellingPrice,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      stockId: result.insertId,
    });
  } catch (error) {
    console.error("Add stock error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to add stock",
      error: error.message,
    });
  }
});

// =====================================
// UPDATE STOCK
// =====================================
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      type,
      quantity,
      purchasePrice,
      sellingPrice,
    } = req.body;

    if (
      !type ||
      quantity === undefined ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Type, quantity, purchase price and selling price are required",
      });
    }

    const [result] = await db.query(
      `
      UPDATE stocks
      SET
        type = ?,
        quantity = ?,
        purchase_price = ?,
        selling_price = ?
      WHERE id = ?
        AND user_id = ?
        AND deleted = 0
      `,
      [
        type,
        quantity,
        purchasePrice,
        sellingPrice,
        id,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Stock not found or does not belong to this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Update stock error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
});

// =====================================
// SOFT DELETE STOCK
// =====================================
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `
      UPDATE stocks
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
        message:
          "Stock not found or does not belong to this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
    });
  } catch (error) {
    console.error("Delete stock error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete stock",
      error: error.message,
    });
  }
});

module.exports = router;