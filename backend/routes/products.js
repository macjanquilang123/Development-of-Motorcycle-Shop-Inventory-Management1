const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Assuming you have a database connection module

// ===============================
//  Fetch all products
// ===============================
router.get("/", (req, res) => {
  const query = `
    SELECT 
      p.product_id, 
      p.name, 
      CAST(p.price AS DECIMAL(10, 2)) AS price, 
      p.quantity, 
      p.image, 
      c.name AS category_name, 
      s.name AS supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    } else {
      res.json(results);
    }
  });
});

// ===============================
//  Add a new product with category and supplier names
// ===============================
router.post("/", (req, res) => {
  const { name, category_id, supplier_id, price, quantity, image } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO products (name, category_id, supplier_id, price, quantity, image)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  db.query(
    query,
    [name, category_id || null, supplier_id || null, price, quantity, image || null],
    (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        return res.status(500).json({ error: "Failed to add product" });
      }

      // Fetch the product with category and supplier names after insertion
      const productId = result.insertId;
      const fetchProductQuery = `
        SELECT 
          p.product_id, 
          p.name, 
          p.price, 
          p.quantity, 
          p.image, 
          c.name AS category_name, 
          s.name AS supplier_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
        WHERE p.product_id = ?;
      `;

      db.query(fetchProductQuery, [productId], (fetchErr, productResults) => {
        if (fetchErr) {
          console.error("Error fetching product:", fetchErr);
          return res.status(500).json({ error: "Failed to fetch product with category and supplier" });
        }

        res.json(productResults[0]);
      });
    }
  );
});

// ===============================
//  Update a product
// ===============================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, category_id, supplier_id, price, quantity, image } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    UPDATE products
    SET name = ?, category_id = ?, supplier_id = ?, price = ?, quantity = ?, image = ?
    WHERE product_id = ?;
  `;

  db.query(
    query,
    [name, category_id || null, supplier_id || null, price, quantity, image || null, id],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ error: "Failed to update product" });
      }

      // Fetch the updated product with category and supplier names
      const fetchProductQuery = `
        SELECT 
          p.product_id, 
          p.name, 
          p.price, 
          p.quantity, 
          p.image, 
          c.name AS category_name, 
          s.name AS supplier_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
        WHERE p.product_id = ?;
      `;

      db.query(fetchProductQuery, [id], (fetchErr, productResults) => {
        if (fetchErr) {
          console.error("Error fetching updated product:", fetchErr);
          return res.status(500).json({ error: "Failed to fetch updated product" });
        }

        res.json(productResults[0]);
      });
    }
  );
});

// ===============================
//  Delete a product
// ===============================
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE product_id = ?", [id], (err, result) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          message: "This product is referenced in sales and cannot be deleted.",
        });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

module.exports = router;