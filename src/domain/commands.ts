import { DomainError } from './errors'
import type {
  DomainState,
  Entity,
  EntityCreatedEvent,
  EntityKind,
  EntityId,
  EventId,
  ISODateTime,
  Relation,
  RelationCreatedEvent,
  RelationId,
  SessionId,
  SessionStartedEvent,
  SessionStoppedEvent,
  WorkCompletedEvent,
} from './types'

interface EventMetadata {
  readonly eventId: EventId
  readonly occurredAt: ISODateTime
}

interface CreateEntityInput {
  readonly id: EntityId
  readonly kind: EntityKind
  readonly name: string
  readonly description?: string
}

export function createEntityEvent(
  state: DomainState,
  input: CreateEntityInput,
  metadata: EventMetadata,
): EntityCreatedEvent {
  const name = input.name.trim()

  if (!name) {
    throw new DomainError('EMPTY_NAME', 'Give this entity a name before creating it.')
  }

  if (state.entities.some((entity) => entity.id === input.id)) {
    throw new DomainError('INVALID_EVENT_STREAM', 'This entity identifier is already in use.')
  }

  const entity: Entity = {
    id: input.id,
    kind: input.kind,
    name,
    description: input.description?.trim() ?? '',
    status: 'active',
    createdAt: metadata.occurredAt,
    updatedAt: metadata.occurredAt,
  }

  return {
    id: metadata.eventId,
    type: 'entity.created',
    occurredAt: metadata.occurredAt,
    payload: { entity },
  }
}

export function createRelationEvent(
  state: DomainState,
  projectId: EntityId,
  goalId: EntityId,
  relationId: RelationId,
  metadata: EventMetadata,
): RelationCreatedEvent {
  const project = state.entities.find((entity) => entity.id === projectId)
  const goal = state.entities.find((entity) => entity.id === goalId)

  if (!project || !goal) {
    throw new DomainError('ENTITY_NOT_FOUND', 'Both entities must exist before they can be linked.')
  }

  if (project.kind !== 'project' || goal.kind !== 'goal' || projectId === goalId) {
    throw new DomainError(
      'INVALID_RELATION',
      'A supports relation must connect a project to a goal.',
    )
  }

  const duplicate = state.relations.some(
    (relation) =>
      relation.kind === 'supports' &&
      relation.sourceEntityId === projectId &&
      relation.targetEntityId === goalId,
  )

  if (duplicate) {
    throw new DomainError('DUPLICATE_RELATION', 'That project already supports this goal.')
  }

  if (state.relations.some((relation) => relation.id === relationId)) {
    throw new DomainError('INVALID_EVENT_STREAM', 'This relation identifier is already in use.')
  }

  const relation: Relation = {
    id: relationId,
    kind: 'supports',
    sourceEntityId: projectId,
    targetEntityId: goalId,
    createdAt: metadata.occurredAt,
  }

  return {
    id: metadata.eventId,
    type: 'relation.created',
    occurredAt: metadata.occurredAt,
    payload: { relation },
  }
}

export function createSessionStartedEvent(
  state: DomainState,
  projectId: EntityId,
  sessionId: SessionId,
  metadata: EventMetadata,
): SessionStartedEvent {
  const project = state.entities.find(
    (entity) => entity.id === projectId && entity.kind === 'project',
  )

  if (!project || project.status !== 'active') {
    throw new DomainError('ENTITY_NOT_FOUND', 'Choose an active project to start a session.')
  }

  if (state.sessions.some((session) => !session.stoppedAt)) {
    throw new DomainError(
      'SESSION_ALREADY_ACTIVE',
      'End the current focus session before starting another one.',
    )
  }

  if (state.sessions.some((session) => session.id === sessionId)) {
    throw new DomainError('INVALID_EVENT_STREAM', 'This session identifier is already in use.')
  }

  return {
    id: metadata.eventId,
    type: 'session.started',
    occurredAt: metadata.occurredAt,
    payload: { sessionId, projectId },
  }
}

export function createSessionStoppedEvent(
  state: DomainState,
  metadata: EventMetadata,
): SessionStoppedEvent {
  const session = state.sessions.find((candidate) => !candidate.stoppedAt)

  if (!session) {
    throw new DomainError('NO_ACTIVE_SESSION', 'There is no running session to stop.')
  }

  return {
    id: metadata.eventId,
    type: 'session.stopped',
    occurredAt: metadata.occurredAt,
    payload: {
      sessionId: session.id,
      projectId: session.projectId,
    },
  }
}

export function createWorkCompletedEvent(
  state: DomainState,
  projectId: EntityId,
  note: string,
  metadata: EventMetadata,
): WorkCompletedEvent {
  const project = state.entities.find(
    (entity) => entity.id === projectId && entity.kind === 'project',
  )

  if (!project) {
    throw new DomainError('ENTITY_NOT_FOUND', 'Choose an existing project.')
  }

  return {
    id: metadata.eventId,
    type: 'work.completed',
    occurredAt: metadata.occurredAt,
    payload: { projectId, note: note.trim() },
  }
}
