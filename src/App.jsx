import { useState } from "react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  CircleUserRound,
} from "lucide-react";

import Stock from "./components/stocks";
import Sales from "./components/sales";
import Customers from "./components/customers";
import Reports from "./components/reports";
import Settings from "./components/settings";

import "./App.css";

function App() {
  // =====================================================
  // ACTIVE PAGE
  // =====================================================

  const [activePage, setActivePage] = useState("dashboard");

  // =====================================================
  // SHARED STOCK DATA
  // =====================================================

  const [stocks, setStocks] = useState([
    {
      id: 1,
      type: "Tender Coconut",
      quantity: 500,
      purchasePrice: 25,
      sellingPrice: 35,
    },
    {
      id: 2,
      type: "Mature Coconut",
      quantity: 1500,
      purchasePrice: 18,
      sellingPrice: 28,
    },
    {
      id: 3,
      type: "Dry Coconut",
      quantity: 800,
      purchasePrice: 30,
      sellingPrice: 45,
    },
  ]);

  // =====================================================
  // SHARED SALES DATA
  // =====================================================

  const [sales, setSales] = useState([
    {
      id: 1,
      customer: "Ravi",
      date: "07 Sep 2026",
      quantity: 100,
      rate: 35,
      paid: true,
    },
    {
      id: 2,
      customer: "Kumar",
      date: "07 Sep 2026",
      quantity: 50,
      rate: 36,
      paid: false,
    },
    {
      id: 3,
      customer: "Murugan",
      date: "06 Sep 2026",
      quantity: 80,
      rate: 35,
      paid: true,
    },
  ]);

  // =====================================================
  // SHARED CUSTOMER DATA
  // =====================================================

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Ravi",
      phone: "9876543210",
      address: "Salem",
    },
    {
      id: 2,
      name: "Kumar",
      phone: "9876543211",
      address: "Salem",
    },
    {
      id: 3,
      name: "Murugan",
      phone: "9876543212",
      address: "Salem",
    },
  ]);

  // =====================================================
  // SHARED SETTINGS
  // =====================================================

  const [settings, setSettings] = useState({
    businessName: "Jayaraman Coconuts",
    businessType: "Coconut Business",
    ownerName: "Jayaraman",
    phone: "",
    address: "",
    currency: "INR",
    lowStockLimit: 100,
  });

  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

  const totalStock = stocks.reduce(
    (total, stock) =>
      total + Number(stock.quantity),
    0
  );

  const totalSales = sales.reduce(
    (total, sale) =>
      total +
      Number(sale.quantity) *
        Number(sale.rate),
    0
  );

  const totalCustomers = customers.length;

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "stock",
      label: "Stock",
      icon: Package,
    },
    {
      id: "sales",
      label: "Sales",
      icon: ShoppingCart,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const getPageTitle = () => {
    const page = navigation.find(
      (item) => item.id === activePage
    );

    return page ? page.label : "Dashboard";
  };

  return (
    <div className="app">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="sidebar">

        {/* LOGO / BUSINESS */}

        <div className="sidebar-brand">

          <div className="brand-logo">
            🥥
          </div>

          <div>
            <h2>
              {settings.businessName.replace(
                " Coconuts",
                ""
              )}
            </h2>

            <span>
              Coconuts
            </span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={
                  activePage === item.id
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  setActivePage(item.id)
                }
              >

                <Icon size={21} />

                <span>
                  {item.label}
                </span>

              </button>
            );
          })}

        </nav>

      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="main-content">

        {/* ================================================= */}
        {/* DASHBOARD */}
        {/* ================================================= */}

        {activePage === "dashboard" && (

          <div className="page">

            {/* HEADER */}

            <div className="page-header">

              <div>

                <h1>
                  Dashboard
                </h1>

                <p>
                  Welcome to {settings.businessName}
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#29965f",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  {settings.ownerName
                    ? settings.ownerName
                        .charAt(0)
                        .toUpperCase()
                    : "J"}
                </div>

                <div>

                  <strong>
                    {settings.ownerName}
                  </strong>

                  <p
                    style={{
                      margin: "2px 0 0",
                    }}
                  >
                    Business Owner
                  </p>

                </div>

              </div>

            </div>

            {/* SUMMARY CARDS */}

            <div className="stock-summary">

              {/* TOTAL STOCK */}

              <div className="summary-card">

                <span>
                  Total Stock
                </span>

                <strong>
                  {totalStock.toLocaleString()}
                </strong>

                <small>
                  Coconuts available
                </small>

              </div>

              {/* TOTAL SALES */}

              <div className="summary-card">

                <span>
                  Total Sales
                </span>

                <strong>
                  ₹{totalSales.toLocaleString()}
                </strong>

                <small>
                  Total revenue
                </small>

              </div>

              {/* CUSTOMERS */}

              <div className="summary-card">

                <span>
                  Total Customers
                </span>

                <strong>
                  {totalCustomers.toLocaleString()}
                </strong>

                <small>
                  Registered customers
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

            {/* RECENT SALES */}

            <div className="stock-table-card">

              <div
                className="table-title"
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >

                <div>

                  <h2>
                    Recent Sales
                  </h2>

                  <p>
                    Latest coconut sales
                  </p>

                </div>

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setActivePage("sales")
                  }
                >
                  View All
                </button>

              </div>

              {sales.length === 0 ? (

                <div className="empty-state">

                  <div>
                    💰
                  </div>

                  <h3>
                    No Sales Available
                  </h3>

                  <p>
                    Add a sale to see it here.
                  </p>

                </div>

              ) : (

                <div className="table-container">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Customer
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Rate
                        </th>

                        <th>
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {sales
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((sale) => {

                          const total =
                            Number(
                              sale.quantity
                            ) *
                            Number(
                              sale.rate
                            );

                          return (

                            <tr
                              key={sale.id}
                            >

                              <td>
                                <strong>
                                  {
                                    sale.customer
                                  }
                                </strong>
                              </td>

                              <td>
                                {sale.date}
                              </td>

                              <td>
                                {Number(
                                  sale.quantity
                                ).toLocaleString()}
                              </td>

                              <td>
                                ₹
                                {Number(
                                  sale.rate
                                ).toLocaleString()}
                              </td>

                              <td>
                                ₹
                                {total.toLocaleString()}
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

        )}

        {/* ================================================= */}
        {/* STOCK */}
        {/* ================================================= */}

        {activePage === "stock" && (

          <Stock
            stocks={stocks}
            setStocks={setStocks}
          />

        )}

        {/* ================================================= */}
        {/* SALES */}
        {/* ================================================= */}

        {activePage === "sales" && (

          <Sales
            sales={sales}
            setSales={setSales}
          />

        )}

        {/* ================================================= */}
        {/* CUSTOMERS */}
        {/* ================================================= */}

        {activePage === "customers" && (

          <Customers
            customers={customers}
            setCustomers={setCustomers}
          />

        )}

        {/* ================================================= */}
        {/* REPORTS */}
        {/* ================================================= */}

        {activePage === "reports" && (

          <Reports
            sales={sales}
            stocks={stocks}
          />

        )}

        {/* ================================================= */}
        {/* SETTINGS */}
        {/* ================================================= */}

        {activePage === "settings" && (

          <Settings
            settings={settings}
            setSettings={setSettings}
          />

        )}

      </main>

    </div>
  );
}

export default App;