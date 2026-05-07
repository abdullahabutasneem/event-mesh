import type { Request, Response } from "express"
import type { PlaceOrderHandler } from "../application/PlaceOrderHandler"
import type { ShipOrderHandler } from "../application/ShipOrderHandler"
import type { CancelOrderHandler } from "../application/CancelOrderHandler"
import type { GetOrderQuery } from "../application/GetOrderQuery"

/*
Thin HTTP adapter. No business logic here — just shape translation between
the wire format and the application layer (handlers/queries).

Async errors are forwarded to errorHandler via Express 5's automatic
promise rejection handling.
*/

export class OrderController {
    constructor(
        private placeOrder: PlaceOrderHandler,
        private shipOrder: ShipOrderHandler,
        private cancelOrder: CancelOrderHandler,
        private getOrder: GetOrderQuery,
    ) {}

    place = async (req: Request, res: Response): Promise<void> => {
        const orderId = await this.placeOrder.execute(req.body)
        res.status(202).json({ orderId })
    }

    ship = async (req: Request, res: Response): Promise<void> => {
        await this.shipOrder.execute({ orderId: req.params.id! })
        res.status(202).send()
    }

    cancel = async (req: Request, res: Response): Promise<void> => {
        await this.cancelOrder.execute({
            orderId: req.params.id!,
            reason: req.body.reason,
        })
        res.status(202).send()
    }

    getById = async (req: Request, res: Response): Promise<void> => {
        const dto = await this.getOrder.byId(req.params.id!)
        res.json(dto)
    }

    listByCustomer = async (req: Request, res: Response): Promise<void> => {
        const dtos = await this.getOrder.byCustomer(req.params.customerId!)
        res.json(dtos)
    }
}
