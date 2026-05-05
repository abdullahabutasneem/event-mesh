/*
Read/load step:
   - no stream found -> AggregateNotFoundError
*/

export class AggregateNotFoundError extends Error {
    constructor(public aggregateId: string) {
      super(`Aggregate ${aggregateId} not found`)
      this.name = 'AggregateNotFoundError'
    }
}