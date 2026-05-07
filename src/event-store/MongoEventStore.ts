import mongoose from 'mongoose'
import { EventModel } from './EventSchema'
import { DomainEvent } from '../core/event/DomainEvent'
import { ConcurrencyError } from '../core/errors/ConcurrencyError'

export class MongoEventStore {

  async append(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {

        // Check current version inside transaction
        const latest = await EventModel
          .findOne({ aggregateId })
          .sort({ version: -1 })
          .session(session)
          .lean()

        const currentVersion = latest ? latest.version : -1

        if (currentVersion !== expectedVersion) {
          throw new ConcurrencyError(aggregateId, expectedVersion, currentVersion)
        }

        // Insert all events atomically
        await EventModel.insertMany(
          events.map(e => ({ ...e })),
          { session }
        )
      })
    } catch (err: any) {
      // MongoDB duplicate key = concurrent write happened
      if (err.code === 11000) {
        throw new ConcurrencyError(aggregateId, expectedVersion, -1)
      }
      throw err
    } finally {
      await session.endSession()  // ALWAYS close session
    }
  }

  async load(aggregateId: string): Promise<DomainEvent[]> {
    const docs = await EventModel
      .find({ aggregateId })
      .sort({ version: 1 })      // ORDER BY version ASC — critical
      .lean()                    // plain JS objects, faster

    return docs as unknown as DomainEvent[]
  }

  async loadFromVersion(aggregateId: string, fromVersion: number): Promise<DomainEvent[]> {
    const docs = await EventModel
      .find({ aggregateId, version: { $gte: fromVersion } })
      .sort({ version: 1 })
      .lean()
    return docs as unknown as DomainEvent[]
  }
}