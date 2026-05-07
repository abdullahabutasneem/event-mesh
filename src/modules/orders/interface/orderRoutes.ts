import { Router } from "express"
import { OrderController } from "./OrderController"
import { validate } from "../../../shared/http/validate"
import {
    PlaceOrderBody,
    CancelOrderBody,
    OrderIdParams,
    CustomerIdParams,
} from "./orderSchemas"

/*
Builds the /orders router. Takes a controller (already wired up to
handlers + queries) so this module never imports infrastructure.

Status codes:
  POST /orders                 202 Accepted (write — projection lags)
  POST /orders/:id/ship        202 Accepted
  POST /orders/:id/cancel      202 Accepted
  GET  /orders/:id             200 / 404
  GET  /orders/customer/:cid   200 (possibly empty array)
*/

export const buildOrderRouter = (controller: OrderController): Router => {
    const router = Router()

    router.post(
        "/",
        validate({ body: PlaceOrderBody }),
        controller.place
    )

    router.post(
        "/:id/ship",
        validate({ params: OrderIdParams }),
        controller.ship
    )

    router.post(
        "/:id/cancel",
        validate({ params: OrderIdParams, body: CancelOrderBody }),
        controller.cancel
    )

    router.get(
        "/:id",
        validate({ params: OrderIdParams }),
        controller.getById
    )

    router.get(
        "/customer/:customerId",
        validate({ params: CustomerIdParams }),
        controller.listByCustomer
    )

    return router
}
