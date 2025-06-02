const express = require("express");
const router = express.Router();
const db = require("../config/db");

//  Get all suppliers
router.get("/", (req, res) => {
  const sql = "SELECT * FROM suppliers";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching suppliers:", err);
      return res.status(500).json({ success: false, message: "Error fetching suppliers" });
    }
    res.status(200).json(results);
  });
});

//  Get a single supplier by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM suppliers WHERE supplier_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.json(result[0]);
  });
});

//  Add a new supplier
router.post("/", async (req, res) => {
  const { name, contact_info, address } = req.body;
  const sql = "INSERT INTO suppliers (name, contact_info, address) VALUES (?, ?, ?)";
  db.query(sql, [name, contact_info, address], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, insertId: result.insertId });
  });
});

//  Update a supplier by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, contact_info, address } = req.body;

  if (!name || name.trim() === "" || !contact_info || contact_info.trim() === "" || !address || address.trim() === "") {
    return res.status(400).json({ success: false, message: "Name, contact info, and address cannot be empty" });
  }

  const sql = "UPDATE suppliers SET name = ?, contact_info = ?, address = ? WHERE supplier_id = ?";
  db.query(sql, [name, contact_info, address, id], (err, result) => {
    if (err) {
      console.error("Error updating supplier:", err);
      return res.status(500).json({ success: false, message: "Error updating supplier" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, message: "Supplier updated successfully" });
  });
});

//  Get all suppliers (include address in the response)
router.get("/", (req, res) => {
  const sql = "SELECT * FROM suppliers";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching suppliers:", err);
      return res.status(500).json({ success: false, message: "Error fetching suppliers" });
    }
    res.status(200).json(results); // Address will now be included
  });
});

//  Get a single supplier by ID (include address in the response)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM suppliers WHERE supplier_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.json(result[0]); // Address will now be included
  });
});

//  Delete a supplier
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM suppliers WHERE supplier_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting supplier:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, message: "Supplier deleted successfully" });
  });
});

module.exports = router;