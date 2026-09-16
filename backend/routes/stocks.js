const express = require("express");
const router = express.Router();

const db = require("../db");

// =====================================
// GET ALL STOCKS
// =====================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM stocks ORDER BY id DESC"
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
router.post("/", async (req, res) => {
  try {
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
      (type, quantity, purchase_price, selling_price)
      VALUES (?, ?, ?, ?)
      `,
      [type, quantity, purchasePrice, sellingPrice]
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
router.put("/:id", async (req, res) => {
  try {
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
      `,
      [type, quantity, purchasePrice, sellingPrice, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
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
// DELETE STOCK
// =====================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM stocks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
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