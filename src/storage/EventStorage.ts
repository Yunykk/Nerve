import type { NerveEvent } from '../domain/types'

export interface EventStorage {
  load(): Promise<readonly NerveEvent[]>
  append(events: readonly NerveEvent[]): Promise<readonly NerveEvent[]>
}

export class EventStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'EventStorageError'
  }
}
