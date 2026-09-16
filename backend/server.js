const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const customersRouter = require("./routes/customers");
const salesRouter = require("./routes/sales");
const stocksRouter = require("./routes/stocks");

const app = express();

// =====================================
// CONFIGURATION
// =====================================
const PORT = process.env.PORT || 5000;

// =====================================
// MIDDLEWARE
// =====================================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// BASIC TEST ROUTE
// =====================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jayaraman Coconuts API is running",
  });
});

// =====================================
// HEALTH CHECK
// =====================================
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      success: true,
      status: "OK",
      message: "Backend and MySQL database are working",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health error:", error.message);

    res.status(500).json({
      success: false,
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =====================================
// CUSTOMERS API
// =====================================
app.use("/api/customers", customersRouter);

// =====================================
// SALES API
// =====================================
app.use("/api/sales", salesRouter);

// =====================================
// STOCKS API
// =====================================
app.use("/api/stocks", stocksRouter);

// =====================================
// API ROUTES LIST
// =====================================
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jayaraman Coconuts API",

    availableRoutes: {
      health: "GET /api/health",

      customersGet: "GET /api/customers",
      customersPost: "POST /api/customers",

      salesGet: "GET /api/sales",
      salesPost: "POST /api/sales",
      salesDelete: "DELETE /api/sales/:id",

      stocksGet: "GET /api/stocks",
      stocksPost: "POST /api/stocks",
      stocksPut: "PUT /api/stocks/:id",
      stocksDelete: "DELETE /api/stocks/:id",
    },
  });
});

// =====================================
// 404 HANDLER
// =====================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =====================================
// START SERVER
// =====================================
app.listen(PORT, () => {
  console.log("======================================");
  console.log("Jayaraman Coconuts Backend Started");
  console.log("======================================");

  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`Health API:     http://localhost:${PORT}/api/health`);
  console.log(`Customers API:  http://localhost:${PORT}/api/customers`);
  console.log(`Sales API:      http://localhost:${PORT}/api/sales`);
  console.log(`Stocks API:     http://localhost:${PORT}/api/stocks`);

  console.log("======================================");
});