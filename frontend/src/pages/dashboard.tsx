import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from "chart.js";
import Breadcrumb from "../components/breadcrums";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import { fetchSales, fetchProducts } from "../../api/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Sale {
  sale_id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  sale_date: string;
}

interface Product {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [salesData, productsData] = await Promise.all([fetchSales(), fetchProducts()]);

        console.log("Sales Data:", salesData);
        console.log("Products Data:", productsData);

        // Calculate total revenue
        const revenue = salesData.reduce((sum: number, sale: Sale) => {
          const totalPrice = parseFloat(sale.total_price?.toString() || "0"); // Ensure total_price is valid
          return sum + totalPrice;
        }, 0);
        setTotalRevenue(revenue);

        // Identify low-stock products
        const lowStock = productsData.filter((product: Product) => {
          const quantity = parseInt(product.quantity?.toString() || "0", 10); // Ensure quantity is valid
          return quantity < 10;
        });
        setLowStockProducts(lowStock);

        setSales(salesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []);

  const salesChartData = {
    labels: sales.map((sale) => new Date(sale.sale_date).toLocaleDateString()),
    datasets: [
      {
        label: "Sales Revenue",
        data: sales.map((sale) => sale.total_price),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  const salesChartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // Position of the legend
      },
      title: {
        display: true,
        text: "Sales Revenue Over Time", // Chart title
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date", // X-axis label
        },
      },
      y: {
        title: {
          display: true,
          text: "Revenue (₱)", // Y-axis label
        },
        beginAtZero: true, // Start Y-axis at 0
      },
    },
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content">
        <div className="container-fluid">
          <Breadcrumb title="Dashboard" links={[]} active="Dashboard" />

          <div className="row mb-4">
            {/* Total Revenue */}
            <div className="col-md-3">
              <div className="card text-white bg-success">
                <div className="card-body d-flex align-items-center">
                  <i className="bi bi-currency-dollar me-3" style={{ fontSize: "3rem" }}></i>
                  <div>
                    <h5 className="card-title" style={{ fontSize: "1.5rem", fontWeight: "600" }}>Total Revenue</h5>
                    <p className="card-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                      ₱{totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Products */}
            <div className="col-md-3">
              <div className="card text-white bg-primary">
                <div className="card-body d-flex align-items-center">
                  <i className="bi bi-box-seam me-3" style={{ fontSize: "3rem" }}></i>
                  <div>
                    <h5 className="card-title" style={{ fontSize: "1.5rem", fontWeight: "600" }}>Total Products</h5>
                    <p className="card-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                      {products.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Sales */}
            <div className="col-md-3">
              <div className="card text-white bg-info">
                <div className="card-body d-flex align-items-center">
                  <i className="bi bi-cart-check me-3" style={{ fontSize: "3rem" }}></i>
                  <div>
                    <h5 className="card-title" style={{ fontSize: "1.5rem", fontWeight: "600" }}>Total Sales</h5>
                    <p className="card-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                      {sales.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="col-md-3">
              <div className="card text-white bg-warning">
                <div className="card-body d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle me-3" style={{ fontSize: "3rem" }}></i>
                  <div>
                    <h5 className="card-title" style={{ fontSize: "1.5rem", fontWeight: "600" }}>Low Stock Products</h5>
                    <p className="card-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                      {lowStockProducts.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Recent Sales</h5>
            </div>
            <div className="card-body">
              {sales.length === 0 ? (
                <p>No recent sales available.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Sale Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 5).map((sale) => (
                      <tr key={sale.sale_id}>
                        <td>{sale.sale_id}</td>
                        <td>{sale.product_name}</td>
                        <td>{sale.quantity}</td>
                        <td>₱{sale.total_price.toFixed(2)}</td>
                        <td>{new Date(sale.sale_date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Low Stock Products List */}
          <div className="card">
            <div className="card-header">
              <h5>Low Stock Products</h5>
            </div>
            <div className="card-body">
              {lowStockProducts.length === 0 ? (
                <p>All products are sufficiently stocked.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.product_id}>
                        <td>{product.product_id}</td>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td>₱{parseFloat(product.price?.toString() || "0").toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sales Chart */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Sales Overview</h5>
            </div>
            <div className="card-body">
              {sales.length === 0 ? (
                <p>No sales data available to display.</p>
              ) : (
                <Line data={salesChartData} options={salesChartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;