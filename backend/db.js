const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool(process.env.DATABASE_URL);

db.getConnection()
  .then((connection) => {
    console.log("MySQL cloud connection successful");
    connection.release();
  })
  .catch((error) => {
    console.error("MySQL connection failed:", error.message);
  });

module.exports = db;