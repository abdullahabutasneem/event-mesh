// Version Mismatch Error
export class ConcurrencyError extends Error {
    constructor(
      public aggregateId: string,
      public expected: number,
      public actual: number
    ) {
      super(`Version conflict on ${aggregateId}: expected ${expected}, got ${actual}`)
      this.name = 'ConcurrencyError'
    }
}