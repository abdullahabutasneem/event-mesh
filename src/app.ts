import express from "express"
import { MongoEventStore } from "./event-store/MongoEventStore"
import { OrderRepository } from "./modules/orders/infrastructure/OrderRepository"
import { PlaceOrderHandler } from "./modules/orders/application/PlaceOrderHandler"
import { ShipOrderHandler } from "./modules/orders/application/ShipOrderHandler"
import { CancelOrderHandler } from "./modules/orders/application/CancelOrderHandler"
import { GetOrderQuery } from "./modules/orders/application/GetOrderQuery"
import { OrderController } from "./modules/orders/interface/OrderController"
import { buildOrderRouter } from "./modules/orders/interface/orderRoutes"
import { buildHealthRouter } from "./interface/healthRoutes"
import { RabbitMQEventBus } from "./messaging/RabbitMQEventBus"
import { errorHandler } from "./shared/http/errorHandler"

/*
Composition root. Wires concrete dependencies and returns a configured
Express app.

Why a function (not a top-level singleton): tests can build their own app
with stubbed dependencies and never touch real Mongo/RabbitMQ.

Order of middleware matters:
  json parser -> routes -> errorHandler (last)
*/

export const buildApp = (): express.Express => {
    // Infrastructure
    const eventStore = new MongoEventStore()
    const bus = new RabbitMQEventBus()

    // Domain wiring
    const orderRepo = new OrderRepository(eventStore)
    const placeOrder = new PlaceOrderHandler(orderRepo, bus)
    const shipOrder = new ShipOrderHandler(orderRepo, bus)
    const cancelOrder = new CancelOrderHandler(orderRepo, bus)
    const getOrder = new GetOrderQuery()

    const orderController = new OrderController(
        placeOrder,
        shipOrder,
        cancelOrder,
        getOrder,
    )

    // App
    const app = express()
    app.use(express.json())

    app.use("/", buildHealthRouter())
    app.use("/orders", buildOrderRouter(orderController))

    app.use(errorHandler)

    return app
}
