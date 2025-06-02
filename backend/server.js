const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth"); // Your auth route
const uploadRoutes = require("./routes/upload");

require("dotenv").config();

const path = require("path");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const supplierRoutes = require("./routes/suppliers");
const salesRoutes = require("./routes/sales");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sales", salesRoutes); // Register sales routes
app.use("/api/upload", uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
