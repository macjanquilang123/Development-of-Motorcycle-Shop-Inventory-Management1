const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Your DB connection module

// Fetch all sales
router.get("/", (req, res) => {
  const query = `
    SELECT 
      sale_id, 
      product_id, 
      product_name, 
      customer_name, 
      quantity, 
      CAST(price AS DECIMAL(10, 2)) AS price, 
      CAST(discount AS DECIMAL(10, 2)) AS discount,
      CAST(total_price AS DECIMAL(10, 2)) AS total_price, 
      payment_type, 
      sale_date
    FROM sales
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sales:", err);
      res.status(500).json({ error: "Failed to fetch sales" });
    } else {
      res.json(results);
    }
  });
});

// Add a new sale
router.post("/", (req, res) => {
  const { product_id, product_name, customer_name, quantity, price, discount, total_price, payment_type, sale_date } = req.body;

  console.log("Incoming sale data:", req.body);

  if (!product_id || !product_name || quantity == null || price == null || total_price == null || !payment_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // customer_name is allowed to be empty or null

  const saleDate = sale_date ? new Date(sale_date) : new Date();
  const formattedSaleDate = saleDate.toISOString().slice(0, 19).replace("T", " ");

  const insertSaleQuery = `
    INSERT INTO sales 
      (product_id, product_name, customer_name, quantity, price, discount, total_price, payment_type, sale_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const updateProductQuantityQuery = `
    UPDATE products 
    SET quantity = quantity - ? 
    WHERE product_id = ? AND quantity >= ?;
  `;

  db.query(insertSaleQuery, [product_id, product_name, customer_name, quantity, price, discount || 0, total_price, payment_type, formattedSaleDate], (err, result) => {
    if (err) {
      console.error("Error adding sale:", err);
      return res.status(500).json({ error: "Failed to add sale", details: err.message });
    }

    db.query(updateProductQuantityQuery, [quantity, product_id, quantity], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating product quantity:", updateErr);
        return res.status(500).json({ error: "Failed to update product quantity", details: updateErr.message });
      }

      if (updateResult.affectedRows === 0) {
        console.error(`No rows updated. Either insufficient stock or invalid product_id: ${product_id}`);
        return res.status(400).json({ error: "Insufficient stock for the product" });
      }

      res.status(201).json({ message: "Sale added successfully", sale_id: result.insertId });
    });
  });
});

// Delete a sale by ID
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM sales WHERE sale_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting sale:", err);
      return res.status(500).json({ error: "Failed to delete sale" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json({ message: "Sale deleted successfully" });
  });
});

module.exports = router;
