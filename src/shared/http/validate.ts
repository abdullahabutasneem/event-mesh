import type { Request, Response, NextFunction, RequestHandler } from "express"
import type { ZodType } from "zod"

/*
Zod-based request validator. Parses (and replaces) the chosen part of the
request with the zod-checked value, so downstream handlers get typed input.

If validation fails, the ZodError is forwarded to the central errorHandler,
which maps it to a 400 with the issue list.

Usage:
    router.post("/orders", validate({ body: PlaceOrderRequest }), ...)
*/

interface Schemas {
    body?: ZodType
    params?: ZodType
    query?: ZodType
}

export const validate = (schemas: Schemas): RequestHandler => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (schemas.body)   req.body   = schemas.body.parse(req.body)
            if (schemas.params) req.params = schemas.params.parse(req.params)
            if (schemas.query)  Object.assign(req.query, schemas.query.parse(req.query))
            next()
        } catch (err) {
            next(err)
        }
    }
}
