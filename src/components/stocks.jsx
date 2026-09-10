import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";

function Stock({ stocks, setStocks }) {


  const totalStock = stocks.reduce(
    (total, stock) => total + Number(stock.quantity),
    0
  );

  // =========================
  // ADD / EDIT FORM
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    type: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
  });

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =========================
  // OPEN ADD FORM
  // =========================

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

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (stock) => {
    setEditId(stock.id);

    setForm({
      type: stock.type,
      quantity: stock.quantity,
      purchasePrice: stock.purchasePrice,
      sellingPrice: stock.sellingPrice,
    });

    setShowForm(true);
  };

  // =========================
  // ADD / EDIT STOCK
  // =========================

  const handleSubmit = (e) => {
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

    const newQuantity = Number(form.quantity);
    const purchasePrice = Number(form.purchasePrice);
    const sellingPrice = Number(form.sellingPrice);

    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
      alert("Quantity cannot be negative");
      return;
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      alert("Please enter a valid purchase price");
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      alert("Please enter a valid selling price");
      return;
    }

    const stockData = {
      type: form.type.trim(),
      quantity: newQuantity,
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
    };

    // =========================
    // EDIT EXISTING STOCK
    // =========================

    if (editId !== null) {
      setStocks((currentStocks) =>
        currentStocks.map((stock) =>
          stock.id === editId
            ? {
                ...stock,
                ...stockData,
              }
            : stock
        )
      );
    }

    // =========================
    // ADD NEW STOCK
    // =========================

    else {
      const newStock = {
        id: Date.now(),
        ...stockData,
      };

      setStocks((currentStocks) => [
        ...currentStocks,
        newStock,
      ]);
    }

    // =========================
    // CLEAR FORM
    // =========================

    setForm({
      type: "",
      quantity: "",
      purchasePrice: "",
      sellingPrice: "",
    });

    setEditId(null);
    setShowForm(false);
  };

  // =========================
  // DELETE STOCK
  // =========================

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stock?"
    );

    if (!confirmDelete) {
      return;
    }

    setStocks((currentStocks) =>
      currentStocks.filter((stock) => stock.id !== id)
    );
  };

  // =========================
  // RESET ALL STOCK
  // =========================

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all stock data?"
    );

    if (!confirmReset) {
      return;
    }

    setStocks([]);
  };

  // =========================
  // STOCK VALUE
  // =========================

  const totalValue = stocks.reduce(
    (total, stock) =>
      total +
      Number(stock.quantity) * Number(stock.sellingPrice),
    0
  );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="page">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

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

      {/* ========================= */}
      {/* SUMMARY CARDS */}
      {/* ========================= */}

      <div className="stock-summary">

        {/* TOTAL STOCK */}

        <div className="summary-card">

          <div className="summary-card-header">

            <span>
              Total Stock
            </span>

          </div>

          <strong>
            {totalStock.toLocaleString()}
          </strong>

          <small>
            Coconuts available
          </small>

        </div>

        {/* STOCK VALUE */}

        <div className="summary-card">

          <span>
            Stock Value
          </span>

          <strong>
            ₹{totalValue.toLocaleString()}
          </strong>

          <small>
            Current selling value
          </small>

        </div>

        {/* STOCK TYPES */}

        <div className="summary-card">

          <span>
            Stock Types
          </span>

          <strong>
            {stocks.length}
          </strong>

          <small>
            Different varieties
          </small>

        </div>

      </div>

      {/* ========================= */}
      {/* ADD / EDIT FORM */}
      {/* ========================= */}

      {showForm && (

        <div className="form-card">

          <h2>
            {editId !== null
              ? "Edit Stock"
              : "Add New Stock"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* COCONUT TYPE */}

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

              {/* QUANTITY */}

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

              {/* PURCHASE PRICE */}

              <div className="form-group">

                <label>
                  Purchase Price
                </label>

                <input
                  type="number"
                  name="purchasePrice"
                  min="0"
                  placeholder="₹ Purchase price"
                  value={form.purchasePrice}
                  onChange={handleChange}
                />

              </div>

              {/* SELLING PRICE */}

              <div className="form-group">

                <label>
                  Selling Price
                </label>

                <input
                  type="number"
                  name="sellingPrice"
                  min="0"
                  placeholder="₹ Selling price"
                  value={form.sellingPrice}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="form-buttons">

              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);

                  setForm({
                    type: "",
                    quantity: "",
                    purchasePrice: "",
                    sellingPrice: "",
                  });
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
                  : "Add Stock"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* ========================= */}
      {/* CURRENT STOCK TABLE */}
      {/* ========================= */}

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

            <div>
              🥥
            </div>

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
                        stock.quantity
                      ).toLocaleString()}
                    </td>

                    <td>
                      ₹{Number(
                        stock.purchasePrice
                      ).toLocaleString()}
                    </td>

                    <td>
                      ₹{Number(
                        stock.sellingPrice
                      ).toLocaleString()}
                    </td>

                    <td>
                      ₹
                      {(
                        Number(stock.quantity) *
                        Number(stock.sellingPrice)
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
                            handleDelete(stock.id)
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