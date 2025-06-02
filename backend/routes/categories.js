const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all categories
router.get("/", (req, res) => {
  const sql = `
    SELECT c.*, 
           EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.category_id) AS in_use
    FROM categories c
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

// Get single category by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM categories WHERE category_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

// Add a new category
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Category name cannot be empty" });
  }

  const sql = "INSERT INTO categories (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error("Error adding category:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    console.log("Category added with ID:", result.insertId); // Debugging log
    res.json({ success: true, insertId: result.insertId });
  });
});

//  PUT: Update a category by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Category name cannot be empty" });
  }

  const sql = "UPDATE categories SET name = ? WHERE category_id = ?";
  db.query(sql, [name, id], (err, result) => {
    if (err) {
      console.error("Error updating category:", err);
      return res.status(500).json({ success: false, message: "Error updating category" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category updated successfully" });
  });
});

// Delete category
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE category_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting category:", err);
      // No need to check for ER_ROW_IS_REFERENCED_2 anymore
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  });
});

module.exports = router;
