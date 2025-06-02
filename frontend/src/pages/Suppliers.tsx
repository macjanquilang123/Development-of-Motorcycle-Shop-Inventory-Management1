import React, { useEffect, useRef, useState } from "react";
import { Grid, html } from "gridjs";
import "bootstrap/dist/css/bootstrap.min.css";
import "gridjs/dist/theme/mermaid.css";
import Breadcrumb from "../components/breadcrums";
import Header from "../layouts/header";
import Sidemenu from "../layouts/sidemenu";
import {
  fetchSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../api/api";

interface Supplier {
  supplier_id: number;
  name: string;
  contact_info: string;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState<number | null>(null);
  const [editSupplierName, setEditSupplierName] = useState("");
  const [editSupplierContact, setEditSupplierContact] = useState("");
  const [editSupplierAddress, setEditSupplierAddress] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const gridInstance = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [contactInfoError, setContactInfoError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      if (Array.isArray(data)) {
        setSuppliers(data);
        renderGrid(data);
      } else {
        setError("Failed to load suppliers: Invalid response format.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = (data: any[]) => {
    if (gridRef.current) {
      if (gridInstance.current) {
        gridInstance.current.destroy();
      }
  
      gridInstance.current = new Grid({
        columns: [
          { name: "Supplier ID", width: "10%" },
          { name: "Name", width: "25%" },
          { name: "Contact Info", width: "25%" },
          { name: "Address", width: "25%" }, // Add address column
          {
            name: "Actions",
            width: "15%",
            formatter: (_: any, row: { cells: { data: any }[] }) => {
              const id = row.cells[0].data;
              const name = row.cells[1].data;
              const contact = row.cells[2].data;
              const address = row.cells[3].data; // Include address
              return html(`
                <div class="btn-group d-flex justify-content-center">
                  <button class="btn btn-sm btn-outline-primary action-btn" data-id="${id}" data-name="${name}" data-contact="${contact}" data-address="${address}" data-action="edit">
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
        data: data.map((s) => [s.supplier_id, s.name, s.contact_info, s.address]), // Include address
        className: {
          table: "table table-striped table-hover",
          thead: "table-dark",
          tbody: "table-light",
        },
      }).render(gridRef.current);
    }
  };

  const handleAddSupplier = async () => {
    let hasError = false;

    if (name.trim() === "") {
      setNameError("Supplier name is required.");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (contactInfo.trim() === "") {
      setContactInfoError("Contact info is required.");
      hasError = true;
    } else {
      setContactInfoError(null);
    }

    if (address.trim() === "") {
      setAddressError("Address is required.");
      hasError = true;
    } else {
      setAddressError(null);
    }

    if (hasError) return;

    try {
      await addSupplier({ name, contact_info: contactInfo, address });
      await loadSuppliers();
      setName("");
      setContactInfo("");
      setAddress("");
      setAddModalVisible(false);
    } catch {
      setError("Failed to add supplier.");
    }
  };
  
  const handleEditSupplier = async () => {
    let hasError = false;

    if (editSupplierName.trim() === "") {
      setNameError("Supplier name is required.");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (editSupplierContact.trim() === "") {
      setContactInfoError("Contact info is required.");
      hasError = true;
    } else {
      setContactInfoError(null);
    }

    if (editSupplierAddress.trim() === "") {
      setAddressError("Address is required.");
      hasError = true;
    } else {
      setAddressError(null);
    }

    if (hasError) return;

    try {
      await updateSupplier(editSupplierId!, {
        name: editSupplierName,
        contact_info: editSupplierContact,
        address: editSupplierAddress,
      });
      await loadSuppliers();
      setEditModalVisible(false);
    } catch {
      setError("Failed to update supplier.");
    }
  };

  const handleDeleteSupplier = async () => {
    if (supplierToDelete === null) return;

    try {
      console.log("Deleting supplier with ID:", supplierToDelete); // Debugging log
      await deleteSupplier(supplierToDelete);
      const updatedList = suppliers.filter((s) => s.supplier_id !== supplierToDelete);
      setSuppliers(updatedList);
      renderGrid(updatedList);
      setDeleteModalVisible(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      setError("Failed to delete supplier.");
    }
  };

  const confirmDeleteSupplier = (id: number) => {
    setSupplierToDelete(id);
    setDeleteModalVisible(true);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest("button[data-action]") as HTMLButtonElement;
      if (!button) return;
  
      const action = button.dataset.action;
      const id = parseInt(button.dataset.id || "", 10);
  
      if (action === "edit") {
        setEditSupplierId(id);
        setEditSupplierName(button.dataset.name || "");
        setEditSupplierContact(button.dataset.contact || "");
        setEditSupplierAddress(button.dataset.address || "");
        setEditModalVisible(true);
      } else if (action === "delete") {
        confirmDeleteSupplier(id);
      }
    };
  
    const gridEl = gridRef.current;
    gridEl?.addEventListener("click", handleClick);
  
    // Cleanup event listener on unmount or re-render
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
            title="Manage Suppliers"
            links={[{ text: "Dashboard", link: "/dashboard" }]}
            active="Suppliers"
            buttons={
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => setAddModalVisible(true)}
              >
                <i className="ri-add-line"></i> Add New Supplier
              </button>
            }
          />
          <div className="box">
            <div className="box-body p-4">
                {addModalVisible && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h3 className="text-lg font-bold mb-4">Add New Supplier</h3>
                      <input
                        type="text"
                        className={`form-control mb-3 ${nameError ? "is-invalid" : ""}`}
                        placeholder="Enter supplier name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {nameError && <div className="text-danger">{nameError}</div>}

                      <input
                        type="text"
                        className={`form-control mb-3 ${contactInfoError ? "is-invalid" : ""}`}
                        placeholder="Enter contact info"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                      />
                      {contactInfoError && <div className="text-danger">{contactInfoError}</div>}

                      <input
                        type="text"
                        className={`form-control mb-4 ${addressError ? "is-invalid" : ""}`}
                        placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                      {addressError && <div className="text-danger">{addressError}</div>}
                      
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary" onClick={() => setAddModalVisible(false)}>
                          Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleAddSupplier}>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                  {editModalVisible && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <h3 className="text-lg font-bold mb-4">Edit Supplier</h3>
                        <input
                          type="text"
                          className={`form-control mb-3 ${nameError ? "is-invalid" : ""}`}
                          placeholder="Enter supplier name"
                          value={editSupplierName}
                          onChange={(e) => setEditSupplierName(e.target.value)}
                        />
                        {nameError && <div className="text-danger">{nameError}</div>}

                        <input
                          type="text"
                          className={`form-control mb-3 ${contactInfoError ? "is-invalid" : ""}`}
                          placeholder="Enter contact info"
                          value={editSupplierContact}
                          onChange={(e) => setEditSupplierContact(e.target.value)}
                        />
                        {contactInfoError && <div className="text-danger">{contactInfoError}</div>}

                        <input
                          type="text"
                          className={`form-control mb-4 ${addressError ? "is-invalid" : ""}`}
                          placeholder="Enter address"
                          value={editSupplierAddress}
                          onChange={(e) => setEditSupplierAddress(e.target.value)}
                        />
                        {addressError && <div className="text-danger">{addressError}</div>}
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-secondary" onClick={() => setEditModalVisible(false)}>
                            Cancel
                          </button>
                          <button className="btn btn-success" onClick={handleEditSupplier}>
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {deleteModalVisible && supplierToDelete !== null && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                        <p className="mb-4">Are you sure you want to delete this supplier?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setDeleteModalVisible(false);
                              setSupplierToDelete(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              if (supplierToDelete !== null) {
                                handleDeleteSupplier(); // always uses latest
                              }
                            }}
                          >
                            Delete
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

export default Suppliers;