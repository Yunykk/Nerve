import type { NerveEvent } from '../domain/types'
import type { EventStorage } from './EventStorage'

export class MemoryEventStorage implements EventStorage {
  private events: readonly NerveEvent[]

  constructor(initialEvents: readonly NerveEvent[] = []) {
    this.events = [...initialEvents]
  }

  async load(): Promise<readonly NerveEvent[]> {
    return [...this.events]
  }

  async append(events: readonly NerveEvent[]): Promise<readonly NerveEvent[]> {
    this.events = [...this.events, ...events]
    return [...this.events]
  }
}
