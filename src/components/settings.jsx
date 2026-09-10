import { useState } from "react";
import {
  Save,
  RotateCcw,
  Building2,
  User,
  Phone,
  MapPin,
  IndianRupee,
  Package,
} from "lucide-react";

function Settings({
  settings,
  setSettings,
}) {
  const [form, setForm] = useState(settings);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.businessName.trim()) {
      alert("Please enter business name");
      return;
    }

    if (!form.ownerName.trim()) {
      alert("Please enter owner name");
      return;
    }

    setSettings({
      ...form,
      businessName: form.businessName.trim(),
      ownerName: form.ownerName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      lowStockLimit: Number(form.lowStockLimit),
    });

    alert("Settings saved successfully");
  };

  // =========================
  // RESET
  // =========================

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset settings?"
    );

    if (!confirmReset) {
      return;
    }

    const defaultSettings = {
      businessName: "Jayaraman Coconuts",
      businessType: "Coconut Business",
      ownerName: "Jayaraman",
      phone: "",
      address: "",
      currency: "INR",
      lowStockLimit: 100,
    };

    setForm(defaultSettings);
    setSettings(defaultSettings);
  };

  return (
    <div className="page">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="page-header">

        <div>
          <h1>Settings</h1>

          <p>
            Manage your business settings
          </p>
        </div>

      </div>

      {/* ========================= */}
      {/* BUSINESS SETTINGS */}
      {/* ========================= */}

      <div className="form-card">

        <div className="table-title">

          <h2>
            Business Information
          </h2>

          <p>
            Update your coconut business details
          </p>

        </div>

        <form onSubmit={handleSave}>

          <div className="form-grid">

            {/* BUSINESS NAME */}

            <div className="form-group">

              <label>
                Business Name
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <Building2
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    opacity: 0.6,
                  }}
                />

                <input
                  type="text"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  style={{
                    paddingLeft: "40px",
                  }}
                />

              </div>

            </div>

            {/* BUSINESS TYPE */}

            <div className="form-group">

              <label>
                Business Type
              </label>

              <input
                type="text"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                placeholder="Enter business type"
              />

            </div>

            {/* OWNER */}

            <div className="form-group">

              <label>
                Owner Name
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <User
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    opacity: 0.6,
                  }}
                />

                <input
                  type="text"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                  style={{
                    paddingLeft: "40px",
                  }}
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="form-group">

              <label>
                Phone Number
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <Phone
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    opacity: 0.6,
                  }}
                />

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={{
                    paddingLeft: "40px",
                  }}
                />

              </div>

            </div>

            {/* ADDRESS */}

            <div
              className="form-group"
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >

              <label>
                Business Address
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <MapPin
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    opacity: 0.6,
                  }}
                />

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter business address"
                  style={{
                    paddingLeft: "40px",
                  }}
                />

              </div>

            </div>

            {/* CURRENCY */}

            <div className="form-group">

              <label>
                Currency
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <IndianRupee
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    opacity: 0.6,
                  }}
                />

                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  style={{
                    paddingLeft: "40px",
                  }}
                >

                  <option value="INR">
                    Indian Rupee (₹)
                  </option>

                  <option value="USD">
                    US Dollar ($)
                  </option>

                  <option value="EUR">
                    Euro (€)
                  </option>

                </select>

              </div>

            </div>

            {/* LOW STOCK LIMIT */}

            <div className="form-group">

              <label>
                Low Stock Alert
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >

                <Package
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    opacity: 0.6,
                  }}
                />

                <input
                  type="number"
                  name="lowStockLimit"
                  min="0"
                  value={form.lowStockLimit}
                  onChange={handleChange}
                  placeholder="Example: 100"
                  style={{
                    paddingLeft: "40px",
                  }}
                />

              </div>

            </div>

          </div>

          {/* ========================= */}
          {/* BUTTONS */}
          {/* ========================= */}

          <div className="form-buttons">

            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Reset
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              <Save size={17} />
              Save Settings
            </button>

          </div>

        </form>

      </div>

      {/* ========================= */}
      {/* INFORMATION */}
      {/* ========================= */}

      <div className="stock-table-card">

        <div className="table-title">

          <h2>
            Settings Information
          </h2>

          <p>
            These settings control your dashboard information.
          </p>

        </div>

        <div
          style={{
            padding: "10px 0",
            lineHeight: "1.8",
          }}
        >

          <p>
            <strong>
              Business:
            </strong>{" "}
            {settings.businessName}
          </p>

          <p>
            <strong>
              Owner:
            </strong>{" "}
            {settings.ownerName}
          </p>

          <p>
            <strong>
              Currency:
            </strong>{" "}
            {settings.currency}
          </p>

          <p>
            <strong>
              Low Stock Alert:
            </strong>{" "}
            {settings.lowStockLimit} coconuts
          </p>

        </div>

      </div>

    </div>
  );
}

export default Settings;