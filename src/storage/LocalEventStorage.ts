import { EventStorageError, type EventStorage } from './EventStorage'
import { ENTITY_KINDS, type NerveEvent } from '../domain/types'
import { projectEvents } from '../domain/projector'

const SCHEMA_VERSION = 1
export const LOCAL_EVENT_STORAGE_KEY = 'nerve:event-stream:v1'

interface StoredEventDocument {
  readonly schemaVersion: typeof SCHEMA_VERSION
  readonly events: readonly NerveEvent[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isISODateTime(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  )
}

function isNerveEvent(value: unknown): value is NerveEvent {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    !isISODateTime(value.occurredAt)
  ) {
    return false
  }

  if (!isRecord(value.payload)) {
    return false
  }

  switch (value.type) {
    case 'entity.created': {
      const entity = value.payload.entity
      return (
        isRecord(entity) &&
        typeof entity.id === 'string' &&
        Boolean(entity.id.trim()) &&
        typeof entity.kind === 'string' &&
        ENTITY_KINDS.some((kind) => kind === entity.kind) &&
        typeof entity.name === 'string' &&
        Boolean(entity.name.trim()) &&
        typeof entity.description === 'string' &&
        (entity.status === 'active' ||
          entity.status === 'completed' ||
          entity.status === 'archived') &&
        isISODateTime(entity.createdAt) &&
        isISODateTime(entity.updatedAt)
      )
    }
    case 'relation.created': {
      const relation = value.payload.relation
      return (
        isRecord(relation) &&
        relation.kind === 'supports' &&
        typeof relation.id === 'string' &&
        Boolean(relation.id.trim()) &&
        typeof relation.sourceEntityId === 'string' &&
        Boolean(relation.sourceEntityId.trim()) &&
        typeof relation.targetEntityId === 'string' &&
        Boolean(relation.targetEntityId.trim()) &&
        isISODateTime(relation.createdAt)
      )
    }
    case 'session.started':
    case 'session.stopped':
      return (
        typeof value.payload.sessionId === 'string' &&
        Boolean(value.payload.sessionId.trim()) &&
        typeof value.payload.projectId === 'string' &&
        Boolean(value.payload.projectId.trim())
      )
    case 'work.completed':
      return (
        typeof value.payload.projectId === 'string' &&
        Boolean(value.payload.projectId.trim()) &&
        typeof value.payload.note === 'string'
      )
    default:
      return false
  }
}

function parseDocument(value: string | null): StoredEventDocument {
  if (value === null) {
    return { schemaVersion: SCHEMA_VERSION, events: [] }
  }

  try {
    const parsed: unknown = JSON.parse(value)

    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== SCHEMA_VERSION ||
      !Array.isArray(parsed.events) ||
      !parsed.events.every(isNerveEvent)
    ) {
      throw new EventStorageError(
        'The local event log uses an unsupported or invalid schema.',
      )
    }

    return {
      schemaVersion: SCHEMA_VERSION,
      events: parsed.events,
    }
  } catch (error) {
    if (error instanceof EventStorageError) {
      throw error
    }

    throw new EventStorageError('The local event log could not be read.', { cause: error })
  }
}

export class LocalEventStorage implements EventStorage {
  constructor(
    private readonly storage: Pick<Storage, 'getItem' | 'setItem'>,
    private readonly key = LOCAL_EVENT_STORAGE_KEY,
  ) {}

  async load(): Promise<readonly NerveEvent[]> {
    return parseDocument(this.storage.getItem(this.key)).events
  }

  async append(events: readonly NerveEvent[]): Promise<readonly NerveEvent[]> {
    const document = parseDocument(this.storage.getItem(this.key))
    const knownIds = new Set(document.events.map((event) => event.id))
    const incomingIds = new Set(events.map((event) => event.id))

    if (
      incomingIds.size !== events.length ||
      events.some((event) => knownIds.has(event.id))
    ) {
      throw new EventStorageError('An event with this identifier is already stored.')
    }

    const nextEvents = [...document.events, ...events]
    // A second tab may have advanced the stream since a store last projected it.
    // Replay the combined history before setItem so a stale command cannot persist
    // an impossible state such as two active sessions.
    projectEvents(nextEvents)
    const nextDocument: StoredEventDocument = {
      schemaVersion: SCHEMA_VERSION,
      events: nextEvents,
    }

    try {
      this.storage.setItem(this.key, JSON.stringify(nextDocument))
    } catch (error) {
      throw new EventStorageError('The event could not be saved locally.', { cause: error })
    }

    return nextEvents
  }
}
