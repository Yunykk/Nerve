export type ISODateTime = string
export type EntityId = string
export type RelationId = string
export type EventId = string
export type SessionId = string

export const ENTITY_KINDS = ['goal', 'project', 'area', 'person', 'device'] as const
export type EntityKind = (typeof ENTITY_KINDS)[number]
export type EntityStatus = 'active' | 'completed' | 'archived'

export interface Entity {
  readonly id: EntityId
  readonly kind: EntityKind
  readonly name: string
  readonly description: string
  readonly status: EntityStatus
  readonly createdAt: ISODateTime
  readonly updatedAt: ISODateTime
}

export type RelationKind = 'supports'

export interface Relation {
  readonly id: RelationId
  readonly kind: RelationKind
  readonly sourceEntityId: EntityId
  readonly targetEntityId: EntityId
  readonly createdAt: ISODateTime
}

interface EventBase<TType extends string, TPayload> {
  readonly id: EventId
  readonly type: TType
  readonly occurredAt: ISODateTime
  readonly payload: Readonly<TPayload>
}

export type EntityCreatedEvent = EventBase<'entity.created', { entity: Entity }>
export type RelationCreatedEvent = EventBase<'relation.created', { relation: Relation }>
export type SessionStartedEvent = EventBase<
  'session.started',
  { sessionId: SessionId; projectId: EntityId }
>
export type SessionStoppedEvent = EventBase<
  'session.stopped',
  { sessionId: SessionId; projectId: EntityId }
>
export type WorkCompletedEvent = EventBase<
  'work.completed',
  { projectId: EntityId; note: string }
>

export type NerveEvent =
  | EntityCreatedEvent
  | RelationCreatedEvent
  | SessionStartedEvent
  | SessionStoppedEvent
  | WorkCompletedEvent

export interface FocusSession {
  readonly id: SessionId
  readonly projectId: EntityId
  readonly startedAt: ISODateTime
  readonly stoppedAt?: ISODateTime
}

export interface DomainState {
  readonly entities: readonly Entity[]
  readonly relations: readonly Relation[]
  readonly sessions: readonly FocusSession[]
  readonly events: readonly NerveEvent[]
}

export const EMPTY_DOMAIN_STATE: DomainState = {
  entities: [],
  relations: [],
  sessions: [],
  events: [],
}
