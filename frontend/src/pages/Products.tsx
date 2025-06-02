import React, { useEffect, useRef, useState } from "react";
import { Grid, html } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Breadcrumb from "../components/breadcrums";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  fetchCategories,
  fetchSuppliers,
} from "../../api/api";

interface Product {
  product_id: number;
  name: string;
  category_id: number;
  supplier_id: number;
  category_name: string;
  supplier_name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Category {
  category_id: number;
  name: string;
}

interface Supplier {
  supplier_id: number;
  name: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const gridInstance = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [productList, categoryList, supplierList] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSuppliers(),
      ]);

      const backendBaseUrl = "http://localhost:5000";

      const productsWithValidData = productList.map((product: Product) => ({
        ...product,
        image: product.image ? `${backendBaseUrl}${product.image}` : "",
        price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
      }));

      console.log("Products with valid data:", productsWithValidData); // Debugging
      setProducts(productsWithValidData);
      setCategories(categoryList);
      setSuppliers(supplierList);
      renderGrid(productsWithValidData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const renderGrid = (data: any[]) => {
    if (gridRef.current) {
      if (gridInstance.current) {
        gridInstance.current.destroy(); // Clear old grid
      }

      gridInstance.current = new Grid({
        columns: [
          { name: "ID", width: "30px" },
          {
            name: "File",
            width: "auto",
            formatter: (_: any, row: { cells: { data: any }[] }) => {
              const fileUrl = row.cells[1].data;
              return html(`
                ${fileUrl
                  ? `<img src="${fileUrl}" alt="Product Image" style="height: auto; width: auto;" />`
                  : `<span>No Image</span>`}
              `);
            },
          },
          { name: "Name", width: "auto" },
          { name: "Category", width: "auto" },
          { name: "Supplier", width: "auto" },
          { name: "Price", width: "auto" },
          { name: "Quantity", width: "auto" },
          {
            name: "Actions",
            width: "auto",
            formatter: (_: any, row: { cells: { data: any }[] }) => {
              const id = row.cells[0].data;
              return html(`
                <div class="btn-group d-flex justify-content-center">
                  <button class="btn btn-sm btn-outline-primary action-btn" 
                  data-id="${id}" data-action="edit">
                    Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger action-btn" data-id="${id}" data-action="delete">
                    Delete
                  </button>
                </div>
              `);
            },
          },
        ],
        search: true,
        sort: true,
        pagination: { limit: 10 },
        data: data.map((p) => [
          p.product_id,
          p.image, // File URL
          p.name,
          p.category_name || "N/A", // Fallback to "N/A"
          p.supplier_name || "N/A", // Fallback to "N/A"
          `₱${p.price.toFixed(2)}`,
          p.quantity,
          null,
        ]),
        className: {
          table: "table table-striped table-hover",
          thead: "table-dark",
          tbody: "table-light",
        },
      }).render(gridRef.current);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return null;
    try {
      const formData = new FormData();
      formData.append("image", image);
      const imageUrl = await uploadImage(formData);
      return imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    }
  };

  const handleAddProduct = async () => {
    // Debugging: Log the form data to check if all fields are populated
    console.log("Adding product:", { name, categoryId, supplierId, price, quantity, image });
  
    if (!name || !categoryId || !supplierId || !price || !quantity) {
      alert("Please fill all required fields.");
      return;
    }
  
    // Handle image upload
    const imageUrl = await handleImageUpload();
    if (imageUrl === null) return; // If image upload failed, stop
  
    try {
      const response = await addProduct({
        name,
        category_id: categoryId,
        supplier_id: supplierId,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        image: imageUrl,
      });
      console.log("Product added successfully:", response);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  
    // Reset form and hide modal after successful addition
    setAddModalVisible(false);
    resetForm();
    loadData();
  };
  

  const handleEditProduct = async () => {
    if (!name || !categoryId || !supplierId || !price || !quantity) {
      alert("Please fill all required fields.");
      return;
    }

    const imageUrl = image ? await handleImageUpload() : undefined;
    try {
      await updateProduct(editProductId!, {
        name,
        category_id: categoryId,
        supplier_id: supplierId,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        image: imageUrl,
      });
      setEditModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (productToDelete === null) return;

    try {
      console.log("Deleting product with ID:", productToDelete); // Debugging log
      await deleteProduct(productToDelete);
      setDeleteModalVisible(false);
      loadData(); // Reload products
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setCategoryId(null);
    setSupplierId(null);
    setPrice("");
    setQuantity("");
    setImage(null);
    setEditProductId(null);

    // Reset file input field
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const confirmDelete = (id: number) => {
    setProductToDelete(id);
    setDeleteModalVisible(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleAction = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest("button[data-action]") as HTMLButtonElement;
      if (!button) return;
  
      const action = button.dataset.action;
      const id = parseInt(button.dataset.id || "", 10);
  
      if (action === "edit") {
        const product = products.find((p) => p.product_id === id);
        if (!product) return;
  
        setEditProductId(product.product_id);
        setName(product.name);
        setCategoryId(product.category_id);
        setSupplierId(product.supplier_id);
        setPrice(product.price.toString());
        setQuantity(product.quantity.toString());
        setEditModalVisible(true);
      } else if (action === "delete") {
        confirmDelete(id);
      }
    };
  
    const gridEl = gridRef.current;
    gridEl?.addEventListener("click", handleAction);
  
    // Cleanup event listener on unmount or re-render
    return () => {
      gridEl?.removeEventListener("click", handleAction);
    };
  }, [products]);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content">
        <div className="container-fluid">
          <Breadcrumb
            title="Manage Products"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Products"
            buttons={
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => setAddModalVisible(true)}
              >
                + Add Product
              </button>
            }
          />
          <div className="box">
            <div className="box-body p-4">
              {/* Add Modal */}
              {addModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h5>Add New Product</h5>
                    <input
                      className="form-control mb-2"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <select
                      className="form-select mb-2"
                      value={categoryId ?? ""}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-select mb-2"
                      value={supplierId ?? ""}
                      onChange={(e) => setSupplierId(Number(e.target.value))}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="form-control mb-2"
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <input
                      className="form-control mb-2"
                      type="number"
                      placeholder="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <input
                      className="form-control mb-2"
                      type="file"
                      accept="image/*" // Allow all image types
                      onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setAddModalVisible(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleAddProduct}>
                      Add Product
                    </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Modal */}
              {editModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h5>Edit Product</h5>
                    <input className="form-control mb-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <select className="form-select mb-2" value={categoryId ?? ""} onChange={(e) => setCategoryId(Number(e.target.value))}>
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select className="form-select mb-2" value={supplierId ?? ""} onChange={(e) => setSupplierId(Number(e.target.value))}>
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="form-control mb-2"
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <input
                      className="form-control mb-2"
                      type="number"
                      placeholder="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <input
                      className="form-control mb-2"
                      type="file"
                      accept="image/*" // Allow all image types
                      onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className="flex justify-end gap-2">
                    <button className="btn btn-secondary" onClick={() => setEditModalVisible(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-success" onClick={handleEditProduct}>
                      Save Changes
                    </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Modal */}
              {deleteModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h5>Are you sure you want to delete this product?</h5>
                    <div className="flex justify-end gap-2">
                    <button className="btn btn-secondary" onClick={() => setDeleteModalVisible(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteProduct}>
                      Yes, Delete
                    </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={gridRef}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
