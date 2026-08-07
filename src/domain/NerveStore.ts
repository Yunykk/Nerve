import {
  createEntityEvent,
  createRelationEvent,
  createSessionStartedEvent,
  createSessionStoppedEvent,
  createWorkCompletedEvent,
} from './commands'
import { applyEvent, projectEvents } from './projector'
import { EMPTY_DOMAIN_STATE, type DomainState, type Entity, type EntityKind } from './types'
import type { EventStorage } from '../storage/EventStorage'

type Listener = (state: DomainState) => void
type Clock = () => Date
type IdGenerator = () => string

interface NerveStoreOptions {
  readonly clock?: Clock
  readonly idGenerator?: IdGenerator
}

function defaultIdGenerator(): string {
  return globalThis.crypto.randomUUID()
}

export class NerveStore {
  private state: DomainState = EMPTY_DOMAIN_STATE
  private readonly listeners = new Set<Listener>()
  private operationQueue: Promise<void> = Promise.resolve()
  private initializePromise: Promise<DomainState> | undefined
  private readonly clock: Clock
  private readonly idGenerator: IdGenerator

  constructor(
    private readonly storage: EventStorage,
    options: NerveStoreOptions = {},
  ) {
    this.clock = options.clock ?? (() => new Date())
    this.idGenerator = options.idGenerator ?? defaultIdGenerator
  }

  getState = (): DomainState => this.state

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  initialize(): Promise<DomainState> {
    if (!this.initializePromise) {
      this.initializePromise = this.enqueue(async () => {
        this.state = projectEvents(await this.storage.load())
        this.emit()
        return this.state
      })
    }

    return this.initializePromise
  }

  createEntity(kind: EntityKind, name: string, description = ''): Promise<Entity> {
    return this.enqueue(async () => {
      const occurredAt = this.clock().toISOString()
      const event = createEntityEvent(
        this.state,
        {
          id: this.idGenerator(),
          kind,
          name,
          description,
        },
        {
          eventId: this.idGenerator(),
          occurredAt,
        },
      )

      await this.commit(event)
      return event.payload.entity
    })
  }

  connectProjectToGoal(projectId: string, goalId: string): Promise<void> {
    return this.enqueue(async () => {
      const event = createRelationEvent(
        this.state,
        projectId,
        goalId,
        this.idGenerator(),
        {
          eventId: this.idGenerator(),
          occurredAt: this.clock().toISOString(),
        },
      )

      await this.commit(event)
    })
  }

  startSession(projectId: string): Promise<void> {
    return this.enqueue(async () => {
      const event = createSessionStartedEvent(
        this.state,
        projectId,
        this.idGenerator(),
        {
          eventId: this.idGenerator(),
          occurredAt: this.clock().toISOString(),
        },
      )

      await this.commit(event)
    })
  }

  stopSession(): Promise<void> {
    return this.enqueue(async () => {
      const event = createSessionStoppedEvent(this.state, {
        eventId: this.idGenerator(),
        occurredAt: this.clock().toISOString(),
      })

      await this.commit(event)
    })
  }

  completeWork(projectId: string, note = ''): Promise<void> {
    return this.enqueue(async () => {
      const event = createWorkCompletedEvent(
        this.state,
        projectId,
        note,
        {
          eventId: this.idGenerator(),
          occurredAt: this.clock().toISOString(),
        },
      )

      await this.commit(event)
    })
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationQueue.then(operation)
    this.operationQueue = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  private async commit(event: Parameters<typeof applyEvent>[1]): Promise<void> {
    // Validate before persistence. Projection after append also incorporates events
    // written by another tab since this store was last hydrated.
    applyEvent(this.state, event)
    const storedEvents = await this.storage.append([event])
    this.state = projectEvents(storedEvents)
    this.emit()
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }
}
