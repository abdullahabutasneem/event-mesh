export interface DomainEvent <T = Record<string, unknown>> {
    readonly id: string;
    readonly type: string
    readonly aggregateId: string
    readonly aggregateType: string
    readonly version: number
    readonly occurredAt: Date
    readonly payload: T
    readonly metadata: {
        correlationId: string
        causationId: string
    }
}