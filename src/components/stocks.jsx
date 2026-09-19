import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";

// =====================================
// BACKEND API URL
// =====================================
const API_URL =
  "https://jayaraman-coconuts-8rvj.onrender.com/api/stocks";

// =====================================
// GET AUTH TOKEN
// =====================================
const getToken = () => {
  try {
    return (
      window.localStorage.getItem("authToken") ||
      window.localStorage.getItem("token")
    );
  } catch (error) {
    console.error("Token read error:", error);
    return null;
  }
};

function Stock({ stocks, setStocks }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
  });

  // =====================================
  // FETCH STOCKS FROM DATABASE
  // =====================================
  const fetchStocks = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch stocks"
        );
      }

      setStocks(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error("Fetch stocks error:", error);
      alert(
        error.message ||
          "Unable to load stocks from database"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD STOCKS WHEN PAGE OPENS
  // =====================================
  useEffect(() => {
    fetchStocks();
  }, []);

  // =====================================
  // SUMMARY
  // =====================================
  const totalStock = stocks.reduce(
    (total, stock) =>
      total + Number(stock.quantity || 0),
    0
  );

  const totalValue = stocks.reduce(
    (total, stock) =>
      total +
      Number(stock.quantity || 0) *
        Number(stock.sellingPrice || 0),
    0
  );

  // =====================================
  // INPUT CHANGE
  // =====================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =====================================
  // OPEN ADD FORM
  // =====================================
  const openAddForm = () => {
    setEditId(null);

    setForm({
      type: "",
      quantity: "",
      purchasePrice: "",
      sellingPrice: "",
    });

    setShowForm(true);
  };

  // =====================================
  // OPEN EDIT FORM
  // =====================================
  const handleEdit = (stock) => {
    setEditId(stock.id);

    setForm({
      type: stock.type || "",
      quantity: stock.quantity || "",
      purchasePrice:
        stock.purchasePrice || "",
      sellingPrice:
        stock.sellingPrice || "",
    });

    setShowForm(true);
  };

  // =====================================
  // ADD / UPDATE STOCK
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.type.trim() === "" ||
      form.quantity === "" ||
      form.purchasePrice === "" ||
      form.sellingPrice === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    const stockData = {
      type: form.type.trim(),
      quantity: Number(form.quantity),
      purchasePrice: Number(
        form.purchasePrice
      ),
      sellingPrice: Number(
        form.sellingPrice
      ),
    };

    if (
      stockData.quantity < 0 ||
      stockData.purchasePrice < 0 ||
      stockData.sellingPrice < 0
    ) {
      alert("Values cannot be negative");
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

      let response;

      // =====================================
      // UPDATE STOCK
      // =====================================
      if (editId !== null) {
        response = await fetch(
          `${API_URL}/${editId}`,
          {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(stockData),
          }
        );
      }

      // =====================================
      // ADD STOCK
      // =====================================
      else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(stockData),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Something went wrong"
        );
        return;
      }

      alert(
        editId !== null
          ? "Stock updated successfully"
          : "Stock added successfully"
      );

      await fetchStocks();

      setForm({
        type: "",
        quantity: "",
        purchasePrice: "",
        sellingPrice: "",
      });

      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error(
        "Save stock error:",
        error
      );

      alert(
        error.message ||
          "Unable to save stock"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // DELETE STOCK
  // =====================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stock?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication required"
        );
      }

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Delete failed"
        );
        return;
      }

      alert(
        "Stock deleted successfully"
      );

      await fetchStocks();
    } catch (error) {
      console.error(
        "Delete stock error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete stock"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // RESET FORM
  // =====================================
  const handleReset = () => {
    setShowForm(false);
    setEditId(null);

    setForm({
      type: "",
      quantity: "",
      purchasePrice: "",
      sellingPrice: "",
    });
  };

  // =====================================
  // LOADING
  // =====================================
  if (loading) {
    return (
      <div className="page">
        <h2>Loading stock data...</h2>
      </div>
    );
  }

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">

        <div>
          <h1>Stock Management</h1>
          <p>
            Manage your coconut stock
          </p>
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
            Add Stock
          </button>

        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="stock-summary">

        <div className="summary-card">
          <span>Total Stock</span>

          <strong>
            {totalStock.toLocaleString()}
          </strong>

          <small>
            Coconuts available
          </small>
        </div>

        <div className="summary-card">
          <span>Stock Value</span>

          <strong>
            ₹{totalValue.toLocaleString()}
          </strong>

          <small>
            Current selling value
          </small>
        </div>

        <div className="summary-card">
          <span>Stock Types</span>

          <strong>
            {stocks.length}
          </strong>

          <small>
            Different varieties
          </small>
        </div>

      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="form-card">

          <h2>
            {editId !== null
              ? "Edit Stock"
              : "Add New Stock"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Coconut Type
                </label>

                <input
                  type="text"
                  name="type"
                  placeholder="Eg: Tender Coconut"
                  value={form.type}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  min="0"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Purchase Price
                </label>

                <input
                  type="number"
                  name="purchasePrice"
                  min="0"
                  placeholder="₹ Purchase price"
                  value={
                    form.purchasePrice
                  }
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Selling Price
                </label>

                <input
                  type="number"
                  name="sellingPrice"
                  min="0"
                  placeholder="₹ Selling price"
                  value={
                    form.sellingPrice
                  }
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="form-buttons">

              <button
                type="button"
                className="cancel-btn"
                onClick={handleReset}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
              >
                {editId !== null
                  ? "Save Changes"
                  : "Add Stock"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* STOCK TABLE */}
      <div className="stock-table-card">

        <div className="table-title">

          <h2>
            Current Stock
          </h2>

          <p>
            All available coconut stock
          </p>

        </div>

        {stocks.length === 0 ? (

          <div className="empty-state">

            <div>🥥</div>

            <h3>
              No Stock Available
            </h3>

            <p>
              Add stock to see it here.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Coconut Type
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Purchase Price
                  </th>

                  <th>
                    Selling Price
                  </th>

                  <th>
                    Stock Value
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {stocks.map((stock) => (

                  <tr key={stock.id}>

                    <td>
                      <strong>
                        {stock.type}
                      </strong>
                    </td>

                    <td>
                      {Number(
                        stock.quantity || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      ₹
                      {Number(
                        stock.purchasePrice || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      ₹
                      {Number(
                        stock.sellingPrice || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      ₹
                      {(
                        Number(
                          stock.quantity || 0
                        ) *
                        Number(
                          stock.sellingPrice || 0
                        )
                      ).toLocaleString()}
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(stock)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              stock.id
                            )
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

export default Stock;