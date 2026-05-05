/* 
Version Mismatch Error
Write/append step:
    - stream exists but version changed unexpectedly -> ConcurrencyError
*/
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