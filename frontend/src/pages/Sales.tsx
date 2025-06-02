import React, { useEffect, useRef, useState } from "react";
import { Grid, html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import Breadcrumb from "../components/breadcrums";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import { fetchSales, addSale, deleteSale, fetchProducts } from "../../api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Sale {
  sale_id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  quantity: number;
  price: number;
  total_price: number;
  payment_type: string;
  sale_date: string;
}

interface Product {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { product_id: number; quantity: number }[]
  >([]);
  const [paymentType, setPaymentType] = useState<string>("cash");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const gridInstance = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [quantityErrors, setQuantityErrors] = useState<{ [productId: number]: boolean }>({});

  const loadSales = async () => {
    try {
      const [salesData, productsData] = await Promise.all([
        fetchSales(),
        fetchProducts(),
      ]);
      // Ensure image is a full URL
      const backendBaseUrl = "http://localhost:5000";
      const productsWithImageUrl = productsData.map((product: Product) => ({
        ...product,
        image: product.image
          ? product.image.startsWith("http")
            ? product.image
            : `${backendBaseUrl}${product.image}`
          : "",
      }));
      setSales(salesData);
      setProducts(productsWithImageUrl);
      setFilteredProducts(productsWithImageUrl);
      renderGrid(salesData);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await fetchProducts();
      console.log("Updated products:", productsData); // Debugging
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const exportSalesReport = () => {
    if (sales.length === 0) {
      alert("No sales data to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Sales Report", 14, 10);

    autoTable(doc, {
      head: [
        [
          "Sale ID",
          "Product",
          "Customer",
          "Quantity",
          "Price",
          "Total Price",
          "Payment Type",
          "Sale Date",
        ],
      ],
      body: sales.map((sale) => [
        sale.sale_id,
        sale.product_name,
        sale.customer_name,
        sale.quantity,
        `₱${parseFloat(sale.price?.toString() || "0").toFixed(2)}`,
        `₱${parseFloat(sale.total_price?.toString() || "0").toFixed(2)}`,
        sale.payment_type,
        new Date(sale.sale_date).toLocaleString(),
      ]),
      theme: "grid",
      styles: {
        fontSize: 10,
      },
    });

    doc.save("sales_report.pdf");
  };

  const renderGrid = (data: Sale[]) => {
    if (gridRef.current) {
      if (gridInstance.current) {
        gridInstance.current.destroy();
      }

      gridInstance.current = new Grid({
        columns: [
          { name: "Sale ID" },
          { name: "Product" },
          { name: "Customer" },
          { name: "Quantity" },
          { name: "Price" },
          { name: "Discount" }, // <-- Add Discount column here
          { name: "Total Price" },
          { name: "Payment Type" },
          { name: "Sale Date" },
          {
            name: "Actions",
            formatter: (_: any, row: { cells: { data: any }[] }) => {
              const id = row.cells[0].data;
              return html(`<button class="btn btn-sm btn-outline-danger delete-btn" data-id="${id}">Delete</button>`);
            },
          },
        ],
        data: data.map((sale) => [
          sale.sale_id,
          sale.product_name,
          sale.customer_name,
          sale.quantity,
          `₱${parseFloat(sale.price?.toString() || "0").toFixed(2)}`,
          `₱${parseFloat((sale as any).discount?.toString() || "0").toFixed(2)}`, // <-- Add Discount value here
          `₱${parseFloat(sale.total_price?.toString() || "0").toFixed(2)}`,
          sale.payment_type,
          new Date(sale.sale_date).toLocaleString(),
        ]),
        className: {
          table: "table table-striped table-hover",
          thead: "table-dark",
          tbody: "table-light",
        },
      }).render(gridRef.current);
    }
  };

  const handleProductSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    productId: number
  ) => {
    if (e.target.checked) {
      setSelectedProducts((prev) => [...prev, { product_id: productId, quantity: 0 }]);
    } else {
      setSelectedProducts((prev) =>
        prev.filter((product) => product.product_id !== productId)
      );
    }
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.product_id === productId ? { ...product, quantity } : product
      )
    );
  };

  const handleAddSale = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    // Check for invalid quantities
    const errors: { [productId: number]: boolean } = {};
    let hasError = false;
    for (const selectedProduct of selectedProducts) {
      const product = products.find((p) => p.product_id === selectedProduct.product_id);
      if (!product || selectedProduct.quantity <= 0 || selectedProduct.quantity > product.quantity) {
        errors[selectedProduct.product_id] = true;
        hasError = true;
      }
    }
    setQuantityErrors(errors);

    if (hasError) {
      // Don't proceed if there are errors
      return;
    }

    try {
      for (const selectedProduct of selectedProducts) {
        const product = products.find((p) => p.product_id === selectedProduct.product_id);
        if (product) {
          const price = parseFloat(product.price?.toString() || "0");
          const totalWithoutDiscount = price * selectedProduct.quantity;
          const saleData = {
            product_id: selectedProduct.product_id,
            product_name: product.name,
            customer_name: customerName,
            quantity: selectedProduct.quantity,
            price: price,
            discount: discount, // <-- Send discount to backend
            total_price: Math.max(0, totalWithoutDiscount - discount), // <-- Apply discount
            payment_type: paymentType,
          };

          console.log("Sending sale data to backend:", saleData);

          await addSale(saleData); // Call the API
        }
      }

      setAddModalVisible(false);
      resetForm();
      await loadSales(); // Refresh sales data
      await loadProducts(); // Refresh product data
      setQuantityErrors({});
    } catch (error) {
      console.error("Error adding sale:", error);
      if (error instanceof Error && typeof (error as any).response === "object") {
        const response = (error as any).response;
        console.error("Backend Error Response:", response.data);
        if (response.data?.error === "Insufficient stock for the product") {
          alert("Insufficient stock for one or more products.");
          return;
        }
        alert(`Error: ${response.data?.error || "Unknown error"}`);
      } else {
        alert("Error: Unable to reach the server");
      }
    }
  };

  const handleDeleteSale = async () => {
    if (!saleToDelete) return;

    try {
      await deleteSale(saleToDelete);
      setDeleteModalVisible(false);
      setSaleToDelete(null);
      await loadSales();
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setPaymentType("cash");
    setCustomerName("");
    setDiscount(0);
  };

  const confirmDelete = (id: number) => {
    setSaleToDelete(id);
    setDeleteModalVisible(true);
  };

  // Register button click events for dynamically rendered Grid.js buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("delete-btn")) {
        const id = parseInt(target.getAttribute("data-id") || "");
        if (!isNaN(id)) {
          confirmDelete(id);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content">
        <div className="container-fluid">
          <Breadcrumb
            title="Manage Sales"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Sales"
            buttons={
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={() => setAddModalVisible(true)}>
                  + Add Sale
                </button>
                <button className="btn btn-success" onClick={exportSalesReport}>
                  Export Report
                </button>
              </div>
            }
          />

          <div className="box">
            <div className="box-body p-4">
              {/* Add Sale Modal */}
              {addModalVisible && (
                <div className="modal-overlay show">
                  <div
                    className="modal-content"
                    style={{
                      width: "1000px",
                      maxWidth: "90vw",
                      minHeight: "600px",
                      padding: "40px",
                      fontSize: "1.18rem",
                    }}
                  >
                    <h4 className="mb-4">Add New Sale</h4>

                    <input
                      type="text"
                      className="form-control mb-4"
                      style={{ fontSize: "1.1rem", padding: "14px" }}
                      placeholder="Search product..."
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        const filtered = products.filter((p) =>
                          p.name.toLowerCase().includes(value)
                        );
                        setFilteredProducts(filtered);
                      }}
                    />

                    {filteredProducts.length === 0 ? (
                      <p style={{ fontSize: "1.1rem" }}>No products available.</p>
                    ) : (
                      <div
                        className="mb-4"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)", // 3 products per row
                          gap: "32px",
                          maxHeight: "420px", // adjust as needed
                          overflowY: "scroll", // <-- always show vertical scrollbar
                          paddingBottom: "16px",
                        }}
                      >
                        {filteredProducts.map((product) => {
                          const isSelected = selectedProducts.some(
                            (p) => p.product_id === product.product_id
                          );
                          const checkboxId = `product-checkbox-${product.product_id}`;
                          return (
                            <div
                              key={product.product_id}
                              className="list-group-item"
                              style={{
                                minWidth: "0",
                                padding: "18px 12px",
                                border: isSelected ? "2.5px solid #0d6efd" : "1.5px solid #e0e0e0",
                                borderRadius: "12px",
                                background: isSelected ? "#f0f8ff" : "#fff",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transition: "border 0.2s, background 0.2s",
                                boxShadow: isSelected ? "0 0 8px #b6d4fe" : "none",
                                position: "relative",
                              }}
                            >
                              <input
                                type="checkbox"
                                id={checkboxId}
                                className="form-check-input"
                                onChange={(e) =>
                                  handleProductSelection(e, product.product_id)
                                }
                                checked={isSelected}
                                style={{
                                  cursor: "pointer",
                                  width: "22px",
                                  height: "22px",
                                  position: "absolute",
                                  top: "16px",
                                  left: "16px",
                                }}
                              />
                              {product.image && (
                                <label htmlFor={checkboxId} style={{ margin: 0, cursor: "pointer" }}>
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                      width: "120px",
                                      height: "120px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      marginBottom: "16px",
                                      border: isSelected ? "2.5px solid #0d6efd" : "2.5px solid transparent",
                                      transition: "border 0.2s"
                                    }}
                                  />
                                </label>
                              )}
                              <label
                                className="form-check-label text-center"
                                htmlFor={checkboxId}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "1.08rem",
                                  fontWeight: 500,
                                  marginBottom: "8px",
                                }}
                              >
                                {product.name}
                              </label>
                              <div style={{ fontSize: "1rem", color: "#555", marginBottom: "8px" }}>
                                ₱{parseFloat(product.price?.toString() || "0").toFixed(2)}
                              </div>
                              <div style={{ fontSize: "0.97rem", color: "#888", marginBottom: "8px" }}>
                                Stock: {product.quantity}
                              </div>
                              {isSelected && (
                                <>
                                  <input
                                    type="number"
                                    className="form-control"
                                    min="1"
                                    max={product.quantity}
                                    placeholder="Qty"
                                    style={{
                                      width: "100px",
                                      fontSize: "1.08rem",
                                      padding: "8px",
                                      borderColor: quantityErrors[product.product_id] ? "red" : undefined,
                                      backgroundColor: quantityErrors[product.product_id] ? "#ffeaea" : undefined,
                                      margin: "0 auto 8px auto",
                                    }}
                                    onChange={(e) => {
                                      handleQuantityChange(product.product_id, Number(e.target.value));
                                      setQuantityErrors((prev) => ({ ...prev, [product.product_id]: false }));
                                    }}
                                    value={
                                      selectedProducts.find((p) => p.product_id === product.product_id)?.quantity || ""
                                    }
                                  />
                                  {quantityErrors[product.product_id] && (
                                    <span style={{ color: "red", fontSize: "0.98em" }}>
                                      Please enter a valid quantity
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <label className="form-label" style={{ fontWeight: 500 }}>Payment Type</label>
                    <select
                      className="form-select mb-4"
                      style={{ fontSize: "1.1rem", padding: "14px" }}
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                      <option value="maya">Maya</option>
                    </select>

                    <div className="mb-4">
                      <label className="form-label" style={{ fontWeight: 500 }}>Customer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: "1.1rem", padding: "14px" }}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name (Optional)"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label" style={{ fontWeight: 500 }}>Discount (₱)</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ fontSize: "1.1rem", padding: "14px" }}
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        placeholder="Enter discount amount"
                      />
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-secondary me-3"
                        style={{ fontSize: "1.1rem", padding: "12px 32px" }}
                        onClick={() => setAddModalVisible(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: "1.1rem", padding: "12px 32px" }}
                        onClick={handleAddSale}
                      >
                        Add Sale
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Modal */}
              {deleteModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content text-center">
                    <h5>Confirm Deletion</h5>
                    <p>Are you sure you want to delete this sale?</p>
                    <div className="d-flex justify-content-center mt-4">
                      <button
                        className="btn btn-outline-secondary me-3"
                        onClick={() => setDeleteModalVisible(false)}
                      >
                        Cancel
                      </button>
                      <button className="btn btn-danger" onClick={handleDeleteSale}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid.js Table */}
              <div ref={gridRef}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sales;
