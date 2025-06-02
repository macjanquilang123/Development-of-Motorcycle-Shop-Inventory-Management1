const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost", // Usually localhost for XAMPP
  user: process.env.DB_USER || "root",      // Default XAMPP username is root
  password: process.env.DB_PASS || "",      // Leave empty if no password in XAMPP
  database: process.env.DB_NAME || "motorcycle_parts_db",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL Database.");
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("✅ MySQL Connected Successfully!");
});

module.exports = db;
