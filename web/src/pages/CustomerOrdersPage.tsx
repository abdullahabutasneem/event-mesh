import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { listOrdersByCustomer } from "../api/orders"
import { ApiError } from "../api/client"
import type { Order } from "../types"

/*
Two modes for the same component:
  - /customers           -> show input, no list yet
  - /customers/:id       -> fetch and display the list

Submitting the form just navigates to /customers/<id>; useEffect picks it up.
That keeps the URL shareable/refresh-friendly.
*/
export const CustomerOrdersPage = () => {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState(customerId ?? "")
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!customerId) {
      setOrders(null)
      return
    }
    setLoading(true)
    setError(null)
    listOrdersByCustomer(customerId)
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof ApiError ? `${err.status} — ${err.message}` : String(err))
      })
      .finally(() => setLoading(false))
  }, [customerId])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) navigate(`/customers/${encodeURIComponent(input.trim())}`)
  }

  return (
    <>
      <h2>Customer orders</h2>

      <form className="card" onSubmit={submit}>
        <label htmlFor="cid">Customer ID</label>
        <div className="row">
          <input
            id="cid"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="cust-123"
          />
          <button type="submit" className="btn" style={{ flex: "0 0 auto" }}>
            Look up
          </button>
        </div>
      </form>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="error">{error}</div>}

      {orders && orders.length === 0 && (
        <p className="muted">No orders found for <code>{customerId}</code>.</p>
      )}

      {orders && orders.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{orders.length} order(s)</h3>
          <ul className="plain">
            {orders.map((o) => (
              <li key={o.orderId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Link to={`/orders/${encodeURIComponent(o.orderId)}`}>
                    <code>{o.orderId}</code>
                  </Link>
                  <div className="muted" style={{ fontSize: "0.82rem", marginTop: 2 }}>
                    {o.items.length} item(s) · placed {new Date(o.placedAt).toLocaleString()}
                  </div>
                </div>
                <span className={`status ${o.status}`}>{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
