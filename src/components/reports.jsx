import {
  IndianRupee,
  Package,
  ShoppingCart,
  Clock,
  BarChart3,
} from "lucide-react";

function Reports({ sales, stocks }) {

  // =========================
  // TOTAL REVENUE
  // =========================

  const totalRevenue = sales.reduce(
    (total, sale) =>
      total +
      Number(sale.quantity) *
        Number(sale.rate),
    0
  );

  // =========================
  // TOTAL COCONUTS SOLD
  // =========================

  const totalQuantity = sales.reduce(
    (total, sale) =>
      total + Number(sale.quantity),
    0
  );

  // =========================
  // PAID AMOUNT
  // =========================

  const paidAmount = sales.reduce(
    (total, sale) =>
      sale.paid
        ? total +
          Number(sale.quantity) *
            Number(sale.rate)
        : total,
    0
  );

  // =========================
  // PENDING AMOUNT
  // =========================

  const pendingAmount = sales.reduce(
    (total, sale) =>
      !sale.paid
        ? total +
          Number(sale.quantity) *
            Number(sale.rate)
        : total,
    0
  );

  // =========================
  // TOTAL STOCK
  // =========================

  const totalStock = stocks.reduce(
    (total, stock) =>
      total + Number(stock.quantity),
    0
  );

  // =========================
  // STOCK VALUE
  // =========================

  const stockValue = stocks.reduce(
    (total, stock) =>
      total +
      Number(stock.quantity) *
        Number(stock.sellingPrice),
    0
  );

  return (

    <div className="page">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="page-header">

        <div>

          <h1>
            Reports
          </h1>

          <p>
            Business reports and performance
          </p>

        </div>

      </div>

      {/* ========================= */}
      {/* SUMMARY CARDS */}
      {/* ========================= */}

      <div className="stock-summary">

        {/* REVENUE */}

        <div className="summary-card">

          <span>
            Total Revenue
          </span>

          <strong>
            ₹{totalRevenue.toLocaleString()}
          </strong>

          <small>
            Total sales revenue
          </small>

        </div>

        {/* COCONUTS SOLD */}

        <div className="summary-card">

          <span>
            Coconuts Sold
          </span>

          <strong>
            {totalQuantity.toLocaleString()}
          </strong>

          <small>
            Total quantity sold
          </small>

        </div>

        {/* PAID */}

        <div className="summary-card">

          <span>
            Paid Amount
          </span>

          <strong>
            ₹{paidAmount.toLocaleString()}
          </strong>

          <small>
            Amount received
          </small>

        </div>

        {/* PENDING */}

        <div className="summary-card">

          <span>
            Pending Amount
          </span>

          <strong>
            ₹{pendingAmount.toLocaleString()}
          </strong>

          <small>
            Amount to collect
          </small>

        </div>

      </div>

      {/* ========================= */}
      {/* SALES REPORT */}
      {/* ========================= */}

      <div className="stock-table-card">

        <div className="table-title">

          <h2>
            Sales Report
          </h2>

          <p>
            Detailed sales performance
          </p>

        </div>

        {sales.length === 0 ? (

          <div className="empty-state">

            <div>
              📊
            </div>

            <h3>
              No Sales Data
            </h3>

            <p>
              Add sales to generate reports.
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
                    Revenue
                  </th>

                  <th>
                    Payment
                  </th>

                </tr>

              </thead>

              <tbody>

                {sales
                  .slice()
                  .reverse()
                  .map((sale) => {

                    const revenue =
                      Number(sale.quantity) *
                      Number(sale.rate);

                    return (

                      <tr key={sale.id}>

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
                            sale.quantity
                          ).toLocaleString()}
                        </td>

                        <td>
                          ₹{Number(
                            sale.rate
                          ).toLocaleString()}
                        </td>

                        <td>
                          ₹{revenue.toLocaleString()}
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

                      </tr>

                    );
                  })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ========================= */}
      {/* STOCK REPORT */}
      {/* ========================= */}

      <div className="stock-table-card">

        <div className="table-title">

          <h2>
            Stock Report
          </h2>

          <p>
            Current coconut stock overview
          </p>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  Coconut Type
                </th>

                <th>
                  Available Stock
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

              </tr>

            </thead>

            <tbody>

              {stocks.map((stock) => {

                const value =
                  Number(stock.quantity) *
                  Number(stock.sellingPrice);

                return (

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
                      ₹{value.toLocaleString()}
                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================= */}
      {/* BUSINESS SUMMARY */}
      {/* ========================= */}

      <div className="stock-table-card">

        <div className="table-title">

          <h2>
            Business Summary
          </h2>

          <p>
            Overall business performance
          </p>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "20px",
            padding: "10px 0",
          }}
        >

          {/* REVENUE */}

          <div className="summary-card">

            <span>
              Total Revenue
            </span>

            <strong>
              ₹{totalRevenue.toLocaleString()}
            </strong>

          </div>

          {/* STOCK */}

          <div className="summary-card">

            <span>
              Current Stock
            </span>

            <strong>
              {totalStock.toLocaleString()}
            </strong>

          </div>

          {/* STOCK VALUE */}

          <div className="summary-card">

            <span>
              Current Stock Value
            </span>

            <strong>
              ₹{stockValue.toLocaleString()}
            </strong>

          </div>

          {/* PENDING */}

          <div className="summary-card">

            <span>
              Amount Pending
            </span>

            <strong>
              ₹{pendingAmount.toLocaleString()}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Reports;