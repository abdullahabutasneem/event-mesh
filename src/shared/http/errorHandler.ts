import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { AggregateNotFoundError } from "../../core/errors/AggregateNotFoundError"
import { ConcurrencyError } from "../../core/errors/ConcurrencyError"
import { logger } from "../logger"

/*
Centralised error mapping. Translates domain/infrastructure errors into HTTP.

  - ZodError                 -> 400  (bad request)
  - AggregateNotFoundError   -> 404  (not in event store / projection)
  - ConcurrencyError         -> 409  (optimistic concurrency conflict)
  - everything else          -> 500

Catches errors thrown from sync handlers AND async ones — relies on Express 5
auto-forwarding rejected promises to next(err).
*/

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof ZodError) {
        res.status(400).json({
            error: "ValidationError",
            issues: err.issues,
        })
        return
    }

    if (err instanceof AggregateNotFoundError) {
        res.status(404).json({
            error: "NotFound",
            message: err.message,
            aggregateId: err.aggregateId,
        })
        return
    }

    if (err instanceof ConcurrencyError) {
        res.status(409).json({
            error: "Conflict",
            message: err.message,
            expected: err.expected,
            actual: err.actual,
        })
        return
    }

    logger.error({ err }, "Unhandled error")
    res.status(500).json({ error: "InternalServerError" })
}
