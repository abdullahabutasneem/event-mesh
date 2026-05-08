import { Link } from "react-router-dom"

/*
Landing page. Two-card dashboard with the primary actions: place an order,
look up a customer's orders. Direct order lookup is also handy when you
already have the orderId from a successful POST response.
*/
export const HomePage = () => (
  <>
    <h2>Welcome</h2>
    <p className="muted">
      Event-sourced order service. Pick an action to get started.
    </p>

    <div className="card">
      <h3>Place an order</h3>
      <p className="muted">Create a new <code>OrderPlaced</code> event.</p>
      <Link to="/place" className="btn" style={{ display: "inline-block", padding: "9px 14px" }}>
        New order →
      </Link>
    </div>

    <div className="card">
      <h3>Look up a customer</h3>
      <p className="muted">List all orders for a given customer ID.</p>
      <Link to="/customers" className="btn secondary" style={{ display: "inline-block", padding: "9px 14px" }}>
        Find customer →
      </Link>
    </div>
  </>
)
