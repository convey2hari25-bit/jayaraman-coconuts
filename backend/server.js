const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const customersRouter = require("./routes/customers");
const salesRouter = require("./routes/sales");
const stocksRouter = require("./routes/stocks");
const authRouter = require("./routes/auth");

console.log("AUTH ROUTER FILE LOADED");

const app = express();

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

// REQUEST LOGGER - DEBUG
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

// =====================================
// BASIC TEST
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
// AUTH API
// =====================================

console.log("MOUNTING AUTH ROUTER...");

app.use("/api/auth", authRouter);

console.log("AUTH ROUTER MOUNTED");

// Temporary test route
app.get("/api/auth-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server auth test working",
  });
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

      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      currentUser: "GET /api/auth/me",

      customersGet: "GET /api/customers",
      customersPost: "POST /api/customers",
      customersPut: "PUT /api/customers/:id",
      customersDelete: "DELETE /api/customers/:id",

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
  console.log("404 ROUTE:", req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// =====================================
// ERROR HANDLER
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
  console.log(`Auth API:       http://localhost:${PORT}/api/auth`);
  console.log(`Customers API:  http://localhost:${PORT}/api/customers`);
  console.log(`Sales API:      http://localhost:${PORT}/api/sales`);
  console.log(`Stocks API:     http://localhost:${PORT}/api/stocks`);

  console.log("======================================");
});