import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { placeOrder } from "../api/orders"
import { ApiError } from "../api/client"
import type { OrderItem } from "../types"

/*
Create-order form. Customer ID + a dynamic list of items.

After a successful POST we navigate to /orders/:id. Because the read model
is eventually-consistent, the OrderDetailPage retries the GET briefly
before showing "not found".
*/

const emptyItem = (): OrderItem => ({ productId: "", quantity: 1 })

export const PlaceOrderPage = () => {
  const navigate = useNavigate()
  const [customerId, setCustomerId] = useState("")
  const [items, setItems] = useState<OrderItem[]>([emptyItem()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateItem = (i: number, patch: Partial<OrderItem>) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { orderId } = await placeOrder({ customerId, items })
      navigate(`/orders/${encodeURIComponent(orderId)}`)
    } catch (err) {
      const msg = err instanceof ApiError ? `${err.status} — ${err.message}` : String(err)
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h2>Place order</h2>

      {error && <div className="error">{error}</div>}

      <form className="card" onSubmit={submit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="customerId">Customer ID</label>
          <input
            id="customerId"
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="cust-123"
            required
          />
        </div>

        <h3 style={{ marginBottom: 8 }}>Items</h3>
        {items.map((item, i) => (
          <div key={i} className="row">
            <div>
              <label>Product ID</label>
              <input
                type="text"
                value={item.productId}
                onChange={(e) => updateItem(i, { productId: e.target.value })}
                placeholder="p-001"
                required
              />
            </div>
            <div style={{ maxWidth: 130 }}>
              <label>Quantity</label>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                required
              />
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              disabled={items.length === 1}
              style={{ flex: "0 0 auto" }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn secondary"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          style={{ marginTop: 4 }}
        >
          + Add item
        </button>

        <hr style={{ borderColor: "var(--border)", margin: "16px 0" }} />

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Placing…" : "Place order"}
        </button>
      </form>
    </>
  )
}
