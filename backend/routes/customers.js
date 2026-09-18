const express = require("express");
const router = express.Router();

const db = require("../db");

// ===============================
// GET ALL CUSTOMERS
// ===============================
router.get("/", async (req, res) => {
  try {
    const [customers] = await db.query(
      "SELECT * FROM customers ORDER BY id DESC"
    );

    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);

    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

// ===============================
// GET CUSTOMER BY ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [customers] = await db.query(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customers[0]);
  } catch (error) {
    console.error("Error fetching customer:", error);

    res.status(500).json({
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
});

// ===============================
// ADD CUSTOMER
// ===============================
router.post("/", async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const [result] = await db.query(
      "INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)",
      [name, phone, address || ""]
    );

    res.status(201).json({
      message: "Customer added successfully",
      customer: {
        id: result.insertId,
        name,
        phone,
        address: address || "",
      },
    });
  } catch (error) {
    console.error("Error adding customer:", error);

    res.status(500).json({
      message: "Failed to add customer",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE CUSTOMER
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const [result] = await db.query(
      `UPDATE customers
       SET name = ?, phone = ?, address = ?
       WHERE id = ?`,
      [name, phone, address || "", id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Error updating customer:", error);

    res.status(500).json({
      message: "Failed to update customer",
      error: error.message,
    });
  }
});

// ===============================
// DELETE CUSTOMER
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether customer exists
    const [customers] = await db.query(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Check whether customer has sales history
    const [sales] = await db.query(
      "SELECT id FROM sales WHERE customer_id = ? AND deleted = 0 LIMIT 1",
      [id]
    );

    // Don't delete customer if sales history exists
    if (sales.length > 0) {
      return res.status(400).json({
        message:
          "Customer cannot be deleted because sales history exists",
      });
    }

    // Delete customer if no sales history exists
    const [result] = await db.query(
      "DELETE FROM customers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);

    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
    });
  }
});

module.exports = router;