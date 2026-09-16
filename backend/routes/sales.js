const express = require("express");
const router = express.Router();

const db = require("../db");

// =====================================
// GET ALL ACTIVE SALES
// Deleted sales will not show
// =====================================
router.get("/", async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT
        sales.id,
        sales.customer_id,
        customers.name AS customer,
        sales.stock_id,
        stocks.type AS stock_type,
        sales.quantity,
        sales.rate,
        sales.quantity * sales.rate AS total_amount,
        sales.paid,
        DATE_FORMAT(sales.sale_date, '%Y-%m-%d') AS sale_date,
        sales.deleted
      FROM sales
      INNER JOIN customers
        ON sales.customer_id = customers.id
      INNER JOIN stocks
        ON sales.stock_id = stocks.id
      WHERE sales.deleted = 0
      ORDER BY sales.id DESC
    `);

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error.message);

    res.status(500).json({
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
});

// =====================================
// GET ALL SALES INCLUDING DELETED
// URL: /api/sales/all
// =====================================
router.get("/all", async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT
        sales.id,
        sales.customer_id,
        customers.name AS customer,
        sales.stock_id,
        stocks.type AS stock_type,
        sales.quantity,
        sales.rate,
        sales.quantity * sales.rate AS total_amount,
        sales.paid,
        DATE_FORMAT(sales.sale_date, '%Y-%m-%d') AS sale_date,
        sales.deleted
      FROM sales
      INNER JOIN customers
        ON sales.customer_id = customers.id
      INNER JOIN stocks
        ON sales.stock_id = stocks.id
      ORDER BY sales.id DESC
    `);

    res.json(sales);
  } catch (error) {
    console.error("Error fetching all sales:", error.message);

    res.status(500).json({
      message: "Failed to fetch all sales",
      error: error.message,
    });
  }
});

// =====================================
// ADD NEW SALE
// =====================================
router.post("/", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      customer_id,
      stock_id,
      quantity,
      rate,
      paid,
      sale_date,
    } = req.body;

    // Validate required fields
    if (!customer_id || !stock_id || !quantity || !rate) {
      connection.release();

      return res.status(400).json({
        message: "Customer, stock, quantity and rate are required",
      });
    }

    if (Number(quantity) <= 0 || Number(rate) <= 0) {
      connection.release();

      return res.status(400).json({
        message: "Quantity and rate must be greater than zero",
      });
    }

    await connection.beginTransaction();

    // Check customer exists
    const [customer] = await connection.query(
      "SELECT id FROM customers WHERE id = ?",
      [customer_id]
    );

    if (customer.length === 0) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Check stock exists
    const [stock] = await connection.query(
      "SELECT id, quantity FROM stocks WHERE id = ? FOR UPDATE",
      [stock_id]
    );

    if (stock.length === 0) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        message: "Stock not found",
      });
    }

    // Check enough stock available
    if (Number(stock[0].quantity) < Number(quantity)) {
      await connection.rollback();
      connection.release();

      return res.status(400).json({
        message: "Not enough stock available",
        availableStock: stock[0].quantity,
      });
    }

    // Insert sale
    const [result] = await connection.query(
      `
      INSERT INTO sales
      (
        customer_id,
        stock_id,
        quantity,
        rate,
        paid,
        sale_date,
        deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, 0)
      `,
      [
        customer_id,
        stock_id,
        quantity,
        rate,
        paid ? 1 : 0,
        sale_date || new Date(),
      ]
    );

    // Reduce stock quantity
    await connection.query(
      `
      UPDATE stocks
      SET quantity = quantity - ?
      WHERE id = ?
      `,
      [quantity, stock_id]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: "Sale added successfully",
      saleId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error adding sale:", error.message);

    res.status(500).json({
      message: "Failed to add sale",
      error: error.message,
    });
  }
});

// =====================================
// SOFT DELETE SALE
// Sale will NOT be physically deleted
// deleted = 1
// Stock quantity will be restored only once
// =====================================
router.delete("/:id", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get only active sale details
    const [sale] = await connection.query(
      `
      SELECT stock_id, quantity
      FROM sales
      WHERE id = ? AND deleted = 0
      FOR UPDATE
      `,
      [id]
    );

    if (sale.length === 0) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        message: "Sale not found or already deleted",
      });
    }

    // Restore stock quantity
    await connection.query(
      `
      UPDATE stocks
      SET quantity = quantity + ?
      WHERE id = ?
      `,
      [sale[0].quantity, sale[0].stock_id]
    );

    // Soft delete sale
    const [result] = await connection.query(
      `
      UPDATE sales
      SET deleted = 1
      WHERE id = ? AND deleted = 0
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        message: "Sale not found or already deleted",
      });
    }

    await connection.commit();
    connection.release();

    res.json({
      message: "Sale deleted successfully",
      saleId: id,
      deleted: true,
      databaseRecordKept: true,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error soft deleting sale:", error.message);

    res.status(500).json({
      message: "Failed to delete sale",
      error: error.message,
    });
  }
});

module.exports = router;