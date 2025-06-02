const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // MySQL connection

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login Request Received with:", { username, password });

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // No user found
    if (results.length === 0) {
      console.log("No User Found!");
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    const user = results[0];
    console.log("User Found:", user);

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password from Input:", password);
    console.log("Password from Database:", user.password);
    console.log("Password Match:", isMatch);

    // Incorrect password
    if (!isMatch) {
      console.log("Password mismatch!");
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    // Generate JWT Token if login successful
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, // Include role if applicable
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login Successful! Token:", token);

    //  Send proper response to the frontend
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  });
});

module.exports = router;
