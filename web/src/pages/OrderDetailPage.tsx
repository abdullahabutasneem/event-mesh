import { useCallback, useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getOrder, shipOrder, cancelOrder } from "../api/orders"
import { ApiError } from "../api/client"
import type { Order } from "../types"

/*
Order detail with ship/cancel actions.

Eventual consistency handling:
  - Backend returns 202 immediately on POST /orders, then the projector
    applies the event to the read model out-of-band.
  - On first load (often arriving from a fresh placement) we briefly retry
    a 404 a few times before giving up. After ~1.5s the projection is
    almost always there in single-node dev.

After ship/cancel we re-fetch with the same retry helper because the new
status flows through the projector too.
*/

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const fetchWithRetry = async (id: string, attempts = 5): Promise<Order> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await getOrder(id)
    } catch (err) {
      const isNotYet = err instanceof ApiError && err.status === 404
      if (!isNotYet || i === attempts - 1) throw err
      await wait(300)
    }
  }
  throw new Error("unreachable")
}

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const refresh = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const o = await fetchWithRetry(orderId)
      setOrder(o)
    } catch (err) {
      setError(err instanceof ApiError ? `${err.status} — ${err.message}` : String(err))
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { refresh() }, [refresh])

  const onShip = async () => {
    if (!orderId) return
    setActing(true)
    setError(null)
    try {
      await shipOrder(orderId)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? `${err.status} — ${err.message}` : String(err))
    } finally {
      setActing(false)
    }
  }

  const onCancel = async () => {
    if (!orderId || !cancelReason.trim()) return
    setActing(true)
    setError(null)
    try {
      await cancelOrder(orderId, cancelReason.trim())
      setCancelReason("")
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? `${err.status} — ${err.message}` : String(err))
    } finally {
      setActing(false)
    }
  }

  if (loading) return <p className="muted">Loading…</p>
  if (error && !order) return <div className="error">{error}</div>
  if (!order) return null

  const canShip   = order.status === "pending"
  const canCancel = order.status === "pending"

  return (
    <>
      <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
        Order <code>{order.orderId}</code>
        <span className={`status ${order.status}`}>{order.status}</span>
      </h2>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Customer:{" "}
          <Link to={`/customers/${encodeURIComponent(order.customerId)}`}>
            <code>{order.customerId}</code>
          </Link>
        </p>
        <p className="muted">Placed: {new Date(order.placedAt).toLocaleString()}</p>
        <p className="muted">Updated: {new Date(order.updatedAt).toLocaleString()}</p>
        {order.cancelReason && (
          <p className="muted">Cancel reason: <em>{order.cancelReason}</em></p>
        )}

        <h3>Items</h3>
        <ul className="plain">
          {order.items.map((it, i) => (
            <li key={i}>
              <code>{it.productId}</code> × {it.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Actions</h3>
        <div className="row">
          <button className="btn" onClick={onShip} disabled={!canShip || acting} style={{ flex: "0 0 auto" }}>
            {acting ? "Working…" : "Ship"}
          </button>
        </div>

        <div className="row">
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancel reason"
            disabled={!canCancel || acting}
          />
          <button
            className="btn danger"
            onClick={onCancel}
            disabled={!canCancel || acting || !cancelReason.trim()}
            style={{ flex: "0 0 auto" }}
          >
            Cancel
          </button>
        </div>

        {!canShip && !canCancel && (
          <p className="muted" style={{ marginBottom: 0 }}>
            No actions available for a <strong>{order.status}</strong> order.
          </p>
        )}
      </div>
    </>
  )
}
