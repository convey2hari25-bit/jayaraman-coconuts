import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Phone,
  MapPin,
} from "lucide-react";

// Backend API URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/customers";

function Customers({ customers = [], setCustomers }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // ==========================================
  // LOAD CUSTOMERS FROM MYSQL
  // ==========================================
  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      // Make sure response is an array
      if (!Array.isArray(data)) {
        throw new Error("Invalid customer data received");
      }

      setCustomers(data);
    } catch (error) {
      console.error("Load customers error:", error);

      alert(
        "Cannot connect to customer API.\n\n" +
        "Make sure backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CUSTOMERS WHEN PAGE OPENS
  // ==========================================
  useEffect(() => {
    loadCustomers();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================
  const openAddForm = () => {
    setEditId(null);

    setForm({
      name: "",
      phone: "",
      address: "",
    });

    setShowForm(true);
  };

  // ==========================================
  // EDIT CUSTOMER
  // ==========================================
  const handleEdit = (customer) => {
    setEditId(customer.id);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setShowForm(true);
  };

  // ==========================================
  // ADD / UPDATE CUSTOMER
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    const customerData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    try {
      // ======================================
      // UPDATE CUSTOMER
      // ======================================
      if (editId !== null) {
        const response = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to update customer"
          );
        }

        alert("Customer updated successfully");

        await loadCustomers();
      }

      // ======================================
      // ADD CUSTOMER
      // ======================================
      else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to add customer"
          );
        }

        alert("Customer added successfully");

        await loadCustomers();
      }

      // Reset form
      setForm({
        name: "",
        phone: "",
        address: "",
      });

      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Save customer error:", error);

      alert(
        error.message ||
          "Something went wrong while saving customer"
      );
    }
  };

  // ==========================================
  // DELETE CUSTOMER
  // ==========================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete customer"
        );
      }

      alert("Customer deleted successfully");

      await loadCustomers();
    } catch (error) {
      console.error("Delete customer error:", error);

      alert(
        error.message ||
          "Something went wrong while deleting customer"
      );
    }
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const handleReset = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
    });

    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your coconut customers</p>
        </div>

        <div className="page-actions">

          <button
            className="reset-btn"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            className="add-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Customer
          </button>

        </div>
      </div>

      {/* ======================================
          SUMMARY
      ====================================== */}

      <div className="stock-summary">

        <div className="summary-card">
          <span>Total Customers</span>

          <strong>
            {customers.length.toLocaleString()}
          </strong>

          <small>
            Registered customers
          </small>
        </div>

        <div className="summary-card">
          <span>Active Customers</span>

          <strong>
            {customers.length.toLocaleString()}
          </strong>

          <small>
            Currently registered
          </small>
        </div>

        <div className="summary-card">
          <span>Customer Records</span>

          <strong>
            {customers.length.toLocaleString()}
          </strong>

          <small>
            Total records
          </small>
        </div>

      </div>

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

      {showForm && (
        <div className="form-card">

          <h2>
            {editId !== null
              ? "Edit Customer"
              : "Add New Customer"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* NAME */}
              <div className="form-group">

                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  value={form.name}
                  onChange={handleChange}
                />

              </div>

              {/* PHONE */}
              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                />

              </div>

              {/* ADDRESS */}
              <div className="form-group">

                <label>
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={form.address}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* BUTTONS */}

            <div className="form-buttons">

              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
              >
                {editId !== null
                  ? "Save Changes"
                  : "Add Customer"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ======================================
          CUSTOMER TABLE
      ====================================== */}

      <div className="stock-table-card">

        <div className="table-title">

          <h2>
            Customer List
          </h2>

          <p>
            All registered customers
          </p>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            <h3>
              Loading Customers...
            </h3>

            <p>
              Please wait.
            </p>

          </div>

        ) : customers.length === 0 ? (

          /* NO CUSTOMERS */

          <div className="empty-state">

            <div>👥</div>

            <h3>
              No Customers Available
            </h3>

            <p>
              Add a customer to see it here.
            </p>

          </div>

        ) : (

          /* CUSTOMER TABLE */

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Address
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {customers.map((customer) => (

                  <tr key={customer.id}>

                    {/* CUSTOMER */}

                    <td>

                      <strong>
                        {customer.name}
                      </strong>

                    </td>

                    {/* PHONE */}

                    <td>

                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <Phone size={15} />

                        {customer.phone}
                      </span>

                    </td>

                    {/* ADDRESS */}

                    <td>

                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <MapPin size={15} />

                        {customer.address || "-"}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(customer)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(customer.id)
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Customers;