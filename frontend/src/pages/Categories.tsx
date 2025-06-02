import React, { useEffect, useRef, useState } from "react";
import { Grid, html } from "gridjs";
import "bootstrap/dist/css/bootstrap.min.css";
import "gridjs/dist/theme/mermaid.css";
import Breadcrumb from "../components/breadcrums";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../api/api";

interface Category {
  category_id: number;
  name: string;
  in_use: boolean;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [deleteErrorModalVisible, setDeleteErrorModalVisible] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const gridInstance = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const confirmDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setDeleteModalVisible(true);
  };

  const renderGrid = (data: Category[]) => {
    if (gridRef.current) {
      if (gridInstance.current) {
        gridInstance.current.destroy();
      }

      gridInstance.current = new Grid({
        columns: [
          { name: "Category ID", width: "10px" },
          { name: "Category Name", width: "150px" },
          {
            name: "Actions",
            width: "100px",
            formatter: (_: any, row: { cells: { data: any }[] }) => {
              const id = row.cells[0].data;
              const name = row.cells[1].data;
              // const inUse = row.cells[2].data; // Not needed anymore

              return html(`
                <div class="btn-group d-flex justify-content-center">
                  <button class="btn btn-sm btn-outline-primary action-btn" data-id="${id}" data-name="${name}" data-action="edit">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger action-btn" data-id="${id}" data-action="delete">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              `);
            },
          },
        ],
        pagination: { limit: 10 },
        search: true,
        sort: true,
        data: data.map((category) => [category.category_id, category.name, category.in_use]),
        className: {
          table: "table table-striped table-hover",
          thead: "table-dark",
          tbody: "table-light",
        },
      }).render(gridRef.current);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      renderGrid(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!name.trim()) {
      setNameError("Category name cannot be empty.");
      return;
    } else {
      setNameError(null);
    }

    try {
      await addCategory({ name });
      await loadCategories();
      setName("");
      setAddModalVisible(false);
    } catch (error) {
      console.error("Failed to add category:", error);
      setError("Failed to add category.");
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      setNameError("Category name cannot be empty.");
      return;
    } else {
      setNameError(null);
    }

    try {
      await updateCategory(editCategoryId!, { name: editCategoryName });
      const updated = categories.map((cat) =>
        cat.category_id === editCategoryId ? { ...cat, name: editCategoryName } : cat
      );
      setEditCategoryId(null);
      setEditCategoryName("");
      setCategories(updated);
      renderGrid(updated);
      setEditModalVisible(false);
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update category.");
    }
  };

  const handleDeleteCategory = async () => {
    if (typeof categoryToDelete !== "number") {
      console.error("Invalid category ID:", categoryToDelete);
      return;
    }

    try {
      await deleteCategory(categoryToDelete);
      const updated = categories.filter((cat) => cat.category_id !== categoryToDelete);
      setCategories(updated);
      renderGrid(updated);
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete category:", error);

      if (error.response?.status === 400 && error.response?.data?.message) {
        setDeleteModalVisible(false);
        setDeleteErrorMessage(error.response.data.message);
        setDeleteErrorModalVisible(true);
      } else {
        setError("Failed to delete category.");
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest("button[data-action]") as HTMLButtonElement;
      if (!button) return;

      const action = button.dataset.action;
      const id = parseInt(button.dataset.id || "", 10);
      const name = button.dataset.name || "";

      if (action === "edit") {
        setEditCategoryId(id);
        setEditCategoryName(name);
        setEditModalVisible(true);
      } else if (action === "delete") {
        confirmDeleteCategory(id);
      }
    };

    const gridEl = gridRef.current;
    gridEl?.addEventListener("click", handleClick);

    return () => {
      gridEl?.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content">
        <div className="container-fluid">
          <Breadcrumb
            title="Manage Categories"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Categories"
            buttons={
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => setAddModalVisible(true)}
              >
                <i className="ri-add-line"></i> Add New Category
              </button>
            }
          />

          <div className="box">
            <div className="box-body p-4">
              {/* Add Modal */}
              {addModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3 className="text-lg font-bold mb-4">Add New Category</h3>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        className={`form-control ${nameError ? "is-invalid" : ""}`}
                        placeholder="Enter category name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {nameError && <div className="text-danger mt-1">{nameError}</div>}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setAddModalVisible(false)}
                      >
                        Cancel
                      </button>
                      <button type="button" className="btn btn-primary" onClick={handleAddCategory}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Modal */}
              {editModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3 className="text-lg font-bold mb-4">Edit Category</h3>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        className="form-control"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditModalVisible(false)}
                      >
                        Cancel
                      </button>
                      <button type="button" className="btn btn-success" onClick={handleEditCategory}>
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
                    <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                    <p className="mb-4">Are you sure you want to delete this category?</p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setDeleteModalVisible(false)}
                      >
                        Cancel
                      </button>
                      <button type="button" className="btn btn-danger" onClick={handleDeleteCategory}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Error Modal */}
              {deleteErrorModalVisible && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3 className="text-lg font-bold mb-4 text-danger">Cannot Delete Category</h3>
                    <p className="mb-4">{deleteErrorMessage}</p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setDeleteErrorModalVisible(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Container */}
              <div ref={gridRef}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
