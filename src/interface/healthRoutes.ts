import { Router } from "express"
import mongoose from "mongoose"

/*
Liveness vs readiness:
  /healthz   — process is up (load-balancer keep-alive)
  /readyz    — dependencies are reachable (Mongo connection state)

Cheap checks only — no actual DB queries on /readyz to avoid amplifying
load during incidents.
*/

export const buildHealthRouter = (): Router => {
    const router = Router()

    router.get("/healthz", (_req, res) => {
        res.json({ status: "ok" })
    })

    router.get("/readyz", (_req, res) => {
        const mongoReady = mongoose.connection.readyState === 1
        if (!mongoReady) {
            res.status(503).json({ status: "not-ready", mongo: false })
            return
        }
        res.json({ status: "ready", mongo: true })
    })

    return router
}
