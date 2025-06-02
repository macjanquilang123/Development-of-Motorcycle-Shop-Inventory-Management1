import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./assets/css/style.css";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/dashboard.tsx";
import Categories from "./pages/Categories.tsx";
import Suppliers from "./pages/Suppliers.tsx";
import Products from "./pages/Products.tsx";
import Sales from "./pages/Sales.tsx";

const handleLogin = () => {
  console.log("User logged in");
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
