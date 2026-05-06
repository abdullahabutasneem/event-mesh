import { Schema, model, Document } from "mongoose";

export interface EventDocument extends Document {
    id: string;
    type: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    occurredAt: Date;
    payload: Record<string, unknown>;
    metadata: {
        correlationId: string;
        causationId: string;
    };
}

const EventSchema = new Schema<EventDocument>({
    id: { type: String, required: true },
    type: { type: String, required: true },
    aggregateId: { type: String, required: true },
    aggregateType: { type: String, required: true },
    version: { type: Number, required: true },
    occurredAt: { type: Date, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, {_id: false, id: false})

EventSchema.index(
    { aggregateId: 1, version: 1 },
    { unique: true }  // E11000 if duplicate → ConcurrencyError
)

export const EventModel = model<EventDocument>('Event', EventSchema)