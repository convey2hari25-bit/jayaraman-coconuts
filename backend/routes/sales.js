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
// GET ALL ACTIVE SALES
// Only logged-in user's sales
// =====================================
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [sales] = await db.query(
      `
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
        DATE_FORMAT(
          sales.sale_date,
          '%Y-%m-%d'
        ) AS sale_date,
        sales.deleted
      FROM sales

      INNER JOIN customers
        ON sales.customer_id = customers.id

      INNER JOIN stocks
        ON sales.stock_id = stocks.id

      WHERE sales.user_id = ?
        AND sales.deleted = 0

      ORDER BY sales.id DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error(
      "Error fetching sales:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
});

// =====================================
// GET ALL SALES INCLUDING DELETED
// URL: /api/sales/all
// Only logged-in user's sales
// =====================================
router.get(
  "/all",
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const [sales] = await db.query(
        `
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
          DATE_FORMAT(
            sales.sale_date,
            '%Y-%m-%d'
          ) AS sale_date,
          sales.deleted
        FROM sales

        INNER JOIN customers
          ON sales.customer_id = customers.id

        INNER JOIN stocks
          ON sales.stock_id = stocks.id

        WHERE sales.user_id = ?

        ORDER BY sales.id DESC
        `,
        [userId]
      );

      res.json({
        success: true,
        data: sales,
      });
    } catch (error) {
      console.error(
        "Error fetching all sales:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch all sales",
        error: error.message,
      });
    }
  }
);

// =====================================
// ADD NEW SALE
// =====================================
router.post(
  "/",
  authenticateUser,
  async (req, res) => {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id;

      const {
        customer_id,
        stock_id,
        quantity,
        rate,
        paid,
        sale_date,
      } = req.body;

      // Validate required fields
      if (
        !customer_id ||
        !stock_id ||
        !quantity ||
        !rate
      ) {
        connection.release();

        return res.status(400).json({
          success: false,
          message:
            "Customer, stock, quantity and rate are required",
        });
      }

      if (
        Number(quantity) <= 0 ||
        Number(rate) <= 0
      ) {
        connection.release();

        return res.status(400).json({
          success: false,
          message:
            "Quantity and rate must be greater than zero",
        });
      }

      await connection.beginTransaction();

      // =====================================
      // CHECK CUSTOMER BELONGS TO USER
      // =====================================
      const [customer] =
        await connection.query(
          `
          SELECT id
          FROM customers
          WHERE id = ?
            AND user_id = ?
          `,
          [customer_id, userId]
        );

      if (customer.length === 0) {
        await connection.rollback();
        connection.release();

        return res.status(404).json({
          success: false,
          message:
            "Customer not found for this user",
        });
      }

      // =====================================
      // CHECK STOCK BELONGS TO USER
      // =====================================
      const [stock] =
        await connection.query(
          `
          SELECT id, quantity
          FROM stocks
          WHERE id = ?
            AND user_id = ?
          FOR UPDATE
          `,
          [stock_id, userId]
        );

      if (stock.length === 0) {
        await connection.rollback();
        connection.release();

        return res.status(404).json({
          success: false,
          message:
            "Stock not found for this user",
        });
      }

      // =====================================
      // CHECK AVAILABLE STOCK
      // =====================================
      if (
        Number(stock[0].quantity) <
        Number(quantity)
      ) {
        await connection.rollback();
        connection.release();

        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
          availableStock:
            stock[0].quantity,
        });
      }

      // =====================================
      // INSERT SALE
      // =====================================
      const [result] =
        await connection.query(
          `
          INSERT INTO sales
          (
            user_id,
            customer_id,
            stock_id,
            quantity,
            rate,
            paid,
            sale_date,
            deleted
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
          `,
          [
            userId,
            customer_id,
            stock_id,
            quantity,
            rate,
            paid ? 1 : 0,
            sale_date || new Date(),
          ]
        );

      // =====================================
      // REDUCE STOCK
      // =====================================
      await connection.query(
        `
        UPDATE stocks
        SET quantity = quantity - ?
        WHERE id = ?
          AND user_id = ?
        `,
        [
          quantity,
          stock_id,
          userId,
        ]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: "Sale added successfully",
        saleId: result.insertId,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();

      console.error(
        "Error adding sale:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to add sale",
        error: error.message,
      });
    }
  }
);

// =====================================
// SOFT DELETE SALE
// Only user's own sale
// =====================================
router.delete(
  "/:id",
  authenticateUser,
  async (req, res) => {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id;
      const { id } = req.params;

      await connection.beginTransaction();

      // =====================================
      // GET SALE
      // =====================================
      const [sale] =
        await connection.query(
          `
          SELECT
            stock_id,
            quantity
          FROM sales
          WHERE id = ?
            AND user_id = ?
            AND deleted = 0
          FOR UPDATE
          `,
          [id, userId]
        );

      if (sale.length === 0) {
        await connection.rollback();
        connection.release();

        return res.status(404).json({
          success: false,
          message:
            "Sale not found or already deleted",
        });
      }

      // =====================================
      // RESTORE STOCK
      // =====================================
      await connection.query(
        `
        UPDATE stocks
        SET quantity = quantity + ?
        WHERE id = ?
          AND user_id = ?
        `,
        [
          sale[0].quantity,
          sale[0].stock_id,
          userId,
        ]
      );

      // =====================================
      // SOFT DELETE SALE
      // =====================================
      const [result] =
        await connection.query(
          `
          UPDATE sales
          SET deleted = 1
          WHERE id = ?
            AND user_id = ?
            AND deleted = 0
          `,
          [id, userId]
        );

      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();

        return res.status(404).json({
          success: false,
          message:
            "Sale not found or already deleted",
        });
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: "Sale deleted successfully",
        saleId: id,
        deleted: true,
        databaseRecordKept: true,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();

      console.error(
        "Error soft deleting sale:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete sale",
        error: error.message,
      });
    }
  }
);

module.exports = router;