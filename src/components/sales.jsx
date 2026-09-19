import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";

const API_URL =
  "https://jayaraman-coconuts-8rvj.onrender.com/api";

function Sales({ sales, setSales }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer: "",
    date: "",
    quantity: "",
    rate: "",
    paid: "Paid",
  });

  // =====================================
  // GET AUTH TOKEN
  // =====================================
  const getToken = () => {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token")
    );
  };

  // =====================================
  // LOAD SALES FROM BACKEND
  // =====================================
  const loadSales = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_URL}/sales`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Sales API failed"
        );
      }

      const salesData = Array.isArray(result.data)
        ? result.data
        : [];

      const formattedSales = salesData.map(
        (sale) => ({
          id: sale.id,
          customer:
            sale.customer ||
            "Unknown Customer",
          date:
            sale.date ||
            sale.sale_date?.split("T")[0] ||
            "",
          quantity: Number(sale.quantity || 0),
          rate: Number(sale.rate || 0),
          paid:
            sale.paid === true ||
            sale.paid === 1 ||
            sale.paid === "1",
          customer_id: sale.customer_id,
          stock_id: sale.stock_id,
        })
      );

      setSales(formattedSales);
    } catch (error) {
      console.error(
        "Load sales error:",
        error
      );

      alert(
        error.message ||
          "Sales data load aagala. Backend running-ah check pannu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // =====================================
  // INPUT CHANGE
  // =====================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // OPEN ADD FORM
  // =====================================
  const openAddForm = () => {
    setEditId(null);

    setForm({
      customer: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      quantity: "",
      rate: "",
      paid: "Paid",
    });

    setShowForm(true);
  };

  // =====================================
  // EDIT SALE
  // =====================================
  const handleEdit = (sale) => {
    setEditId(sale.id);

    setForm({
      customer: sale.customer,
      date: sale.date,
      quantity: sale.quantity,
      rate: sale.rate,
      paid: sale.paid
        ? "Paid"
        : "Pending",
    });

    setShowForm(true);
  };

  // =====================================
  // FIND CUSTOMER ID
  // =====================================
  const getCustomerId = async (
    customerName
  ) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication required"
      );
    }

    const response = await fetch(
      `${API_URL}/customers`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Customers API failed"
      );
    }

    const customers = Array.isArray(
      result.data
    )
      ? result.data
      : [];

    const matchedCustomer =
      customers.find(
        (customer) =>
          customer.name
            .trim()
            .toLowerCase() ===
          customerName
            .trim()
            .toLowerCase()
      );

    if (!matchedCustomer) {
      throw new Error(
        `Customer "${customerName}" database-la illa. First Customers page-la add pannu.`
      );
    }

    return matchedCustomer.id;
  };

  // =====================================
  // GET USER STOCK
  // =====================================
  const getStockId = async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication required"
      );
    }

    const response = await fetch(
      `${API_URL}/stocks`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Stocks API failed"
      );
    }

    const stocks = Array.isArray(
      result.data
    )
      ? result.data
      : [];

    if (stocks.length === 0) {
      throw new Error(
        "No stock available. First add stock before creating a sale."
      );
    }

    return stocks[0].id;
  };

  // =====================================
  // ADD / UPDATE SALE
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.customer.trim() ||
      !form.date ||
      !form.quantity ||
      !form.rate
    ) {
      alert("Please fill all fields");
      return;
    }

    const quantity = Number(form.quantity);
    const rate = Number(form.rate);

    if (quantity <= 0) {
      alert(
        "Quantity must be greater than 0"
      );
      return;
    }

    if (rate < 0) {
      alert("Rate cannot be negative");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication required"
        );
      }

      const customerId =
        await getCustomerId(
          form.customer
        );

      const stockId =
        await getStockId();

      const salePayload = {
        customer_id: Number(customerId),
        stock_id: Number(stockId),
        quantity,
        rate,
        paid:
          form.paid === "Paid" ? 1 : 0,
        sale_date: form.date,
      };

      // =================================
      // EDIT SALE
      // =================================
      if (editId !== null) {
        const response = await fetch(
          `${API_URL}/sales/${editId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(
              salePayload
            ),
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Sale update failed"
          );
        }

        alert(
          "Sale updated successfully"
        );
      }

      // =================================
      // ADD SALE
      // =================================
      else {
        const response = await fetch(
          `${API_URL}/sales`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(
              salePayload
            ),
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Sale save failed"
          );
        }

        alert(
          "Sale saved to MySQL successfully"
        );
      }

      await loadSales();

      setForm({
        customer: "",
        date: "",
        quantity: "",
        rate: "",
        paid: "Paid",
      });

      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error(
        "Save sale error:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // SOFT DELETE SALE
  // =====================================
  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this sale?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication required"
        );
      }

      const response = await fetch(
        `${API_URL}/sales/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Sale delete failed"
        );
      }

      alert(
        "Sale deleted successfully"
      );

      await loadSales();
    } catch (error) {
      console.error(
        "Delete sale error:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // RESET
  // =====================================
  const handleReset = async () => {
    const confirmReset =
      window.confirm(
        "Are you sure you want to reset all sales data?"
      );

    if (!confirmReset) {
      return;
    }

    setSales([]);
  };

  // =====================================
  // TOTAL SALES
  // =====================================
  const totalSales = sales.reduce(
    (total, sale) =>
      total +
      Number(sale.quantity || 0) *
        Number(sale.rate || 0),
    0
  );

  // =====================================
  // TOTAL QUANTITY
  // =====================================
  const totalQuantity =
    sales.reduce(
      (total, sale) =>
        total +
        Number(sale.quantity || 0),
      0
    );

  // =====================================
  // PENDING AMOUNT
  // =====================================
  const pendingAmount =
    sales.reduce(
      (total, sale) =>
        !sale.paid
          ? total +
            Number(sale.quantity || 0) *
              Number(sale.rate || 0)
          : total,
      0
    );

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Sales Management</h1>
          <p>
            Manage your coconut sales
          </p>
        </div>

        <div className="page-actions">
          <button
            className="reset-btn"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            className="add-btn"
            onClick={openAddForm}
            disabled={loading}
          >
            <Plus size={18} />
            Add Sale
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="stock-summary">
        <div className="summary-card">
          <span>Total Sales</span>

          <strong>
            ₹{totalSales.toLocaleString()}
          </strong>

          <small>Total revenue</small>
        </div>

        <div className="summary-card">
          <span>Coconuts Sold</span>

          <strong>
            {totalQuantity.toLocaleString()}
          </strong>

          <small>Total quantity sold</small>
        </div>

        <div className="summary-card">
          <span>Pending Amount</span>

          <strong>
            ₹{pendingAmount.toLocaleString()}
          </strong>

          <small>Amount to collect</small>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-card">
          <h2>
            {editId !== null
              ? "Edit Sale"
              : "Add New Sale"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* CUSTOMER */}
              <div className="form-group">
                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  name="customer"
                  placeholder="Enter customer name"
                  value={form.customer}
                  onChange={handleChange}
                />
              </div>

              {/* DATE */}
              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>

              {/* QUANTITY */}
              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              {/* RATE */}
              <div className="form-group">
                <label>
                  Selling Rate
                </label>

                <input
                  type="number"
                  name="rate"
                  min="0"
                  placeholder="₹ Rate per coconut"
                  value={form.rate}
                  onChange={handleChange}
                />
              </div>

              {/* PAYMENT */}
              <div className="form-group">
                <label>
                  Payment Status
                </label>

                <select
                  name="paid"
                  value={form.paid}
                  onChange={handleChange}
                >
                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>
                </select>
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
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editId !== null
                  ? "Save Changes"
                  : "Add Sale"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SALES HISTORY */}
      <div className="stock-table-card">
        <div className="table-title">
          <h2>Sales History</h2>
          <p>
            All coconut sales records
          </p>
        </div>

        {sales.length === 0 ? (
          <div className="empty-state">
            <div>💰</div>

            <h3>No Sales Available</h3>

            <p>
              Add a sale to see it here.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => {
                  const total =
                    Number(
                      sale.quantity || 0
                    ) *
                    Number(
                      sale.rate || 0
                    );

                  return (
                    <tr
                      key={sale.id}
                    >
                      <td>
                        <strong>
                          {sale.customer}
                        </strong>
                      </td>

                      <td>
                        {sale.date}
                      </td>

                      <td>
                        {Number(
                          sale.quantity || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        ₹
                        {Number(
                          sale.rate || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        ₹
                        {total.toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={
                            sale.paid
                              ? "paid-badge"
                              : "pending-badge"
                          }
                        >
                          {sale.paid
                            ? "Paid"
                            : "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(
                                sale
                              )
                            }
                            title="Edit"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                sale.id
                              )
                            }
                            title="Delete"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;