import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ✅ Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    console.log("Fetched categories from backend:", response.data); // Debugging log
    return response.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    throw new Error("Failed to fetch categories. Please try again later.");
  }
};

// ✅ Add a new category
export const addCategory = async (category: { name: string }) => {
  try {
    const response = await axios.post(`${API_URL}/categories`, category);
    console.log("Added category response:", response.data); // Debugging log
    return response.data;
  } catch (err) {
    console.error("Error adding category:", err);
    throw new Error("Failed to add category");
  }
};

// ✅ Update category
export const updateCategory = async (id: number, category: { name: string }) => {
  try {
    const response = await axios.put(`${API_URL}/categories/${id}`, category);
    return response.data;
  } catch (err) {
    console.error("Error updating category:", err);
    throw err;
  }
};

// ✅ Delete category
export const deleteCategory = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/categories/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting category:", err);
    throw err;
  }
};

// ✅ Fetch all suppliers
export const fetchSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URL}/suppliers`);
    return response.data;
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    throw err;
  }
};

// ✅ Add a new supplier
export const addSupplier = async (supplier: { name: string; contact_info: string; address: string }) => {
  try {
    const response = await axios.post(`${API_URL}/suppliers`, supplier);
    return response.data;
  } catch (err) {
    console.error("Error adding supplier:", err);
    throw err;
  }
};

// ✅ Update supplier
export const updateSupplier = async (id: number, supplier: { name: string; contact_info: string; address: string }) => {
  try {
    const response = await axios.put(`${API_URL}/suppliers/${id}`, supplier);
    return response.data;
  } catch (err) {
    console.error("Error updating supplier:", err);
    throw err;
  }
};

// ✅ Delete supplier
export const deleteSupplier = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/suppliers/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting supplier:", err);
    throw err;
  }
};

// ✅ Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (err) {
    console.error("Error fetching products:", err);
    throw new Error("Failed to fetch products");
  }
};

// ✅ Add a new product
export const addProduct = async (product: {
  name: string;
  category_id: number | null;
  supplier_id: number | null;
  price: number;
  quantity: number;
  image?: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/products`, product);
    return response.data;
  } catch (err) {
    console.error("Error adding product:", err);
    throw err;
  }
};

// ✅ Update product
export const updateProduct = async (id: number, product: { name: string; category_id: number | null;
    supplier_id: number | null;
    price: number;
    quantity: number;
    image?: string;
  }
) => {
  try {
    const response = await axios.put(`${API_URL}/products/${id}`, product);
    return response.data;
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
};

// ✅ Delete product
export const deleteProduct = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/products/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
};

// ✅ Upload image
export const uploadImage = async (formData: FormData) => {
  try {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(`${API_URL}/upload`, formData, config);
    console.log("Image uploaded successfully:", response.data);
    return response.data.imageUrl; // Return the image URL
  } catch (err: any) {
    console.error("Error uploading image:", err.response?.data || err.message);
    throw new Error("Failed to upload image. Please try again later.");
  }
}

// ✅ Fetch all sales
export const fetchSales = async () => {
  try {
    const response = await axios.get(`${API_URL}/sales`);
    return response.data.map((sale: any) => ({
      ...sale,
      price: parseFloat(sale.price) || 0,
      total_price: parseFloat(sale.total_price) || 0,
    }));
  } catch (err) {
    console.error("Error fetching sales:", err);
    throw new Error("Failed to fetch sales");
  }
};

// ✅ Add a new sale
export const addSale = async (sale: {
  product_id: number;
  product_name: string;
  customer_name: string;
  quantity: number;
  price: number;
  discount?: number; // <-- Add this line
  total_price: number;
  payment_type: string;
  sale_date?: string; // Optional in case it's passed manually
}) => {
  try {
    const response = await axios.post(`${API_URL}/sales`, sale);
    return response.data;
  } catch (err: any) {
    console.error("Error adding sale:", err.response?.data || err.message);
    throw new Error("Failed to add sale");
  }
};

// ✅ Delete a sale
export const deleteSale = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/sales/delete/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting sale:", err);
    throw new Error("Failed to delete sale");
  }
};
