export type DomainErrorCode =
  | 'EMPTY_NAME'
  | 'ENTITY_NOT_FOUND'
  | 'INVALID_RELATION'
  | 'DUPLICATE_RELATION'
  | 'SESSION_ALREADY_ACTIVE'
  | 'NO_ACTIVE_SESSION'
  | 'INVALID_EVENT_STREAM'

export class DomainError extends Error {
  readonly code: DomainErrorCode

  constructor(code: DomainErrorCode, message: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
  }
}
