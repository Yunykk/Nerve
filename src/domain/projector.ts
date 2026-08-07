import { DomainError } from './errors'
import {
  ENTITY_KINDS,
  EMPTY_DOMAIN_STATE,
  type DomainState,
  type FocusSession,
  type NerveEvent,
} from './types'

export function applyEvent(state: DomainState, event: NerveEvent): DomainState {
  if (
    !event.id.trim() ||
    !Number.isFinite(Date.parse(event.occurredAt))
  ) {
    throw new DomainError(
      'INVALID_EVENT_STREAM',
      'Every event needs a non-empty identifier and valid occurrence time.',
    )
  }

  if (state.events.some((candidate) => candidate.id === event.id)) {
    throw new DomainError(
      'INVALID_EVENT_STREAM',
      'The event stream contains a duplicate event identifier.',
    )
  }

  switch (event.type) {
    case 'entity.created': {
      const { entity } = event.payload
      const isValidEntity =
        Boolean(entity.id.trim()) &&
        Boolean(entity.name.trim()) &&
        ENTITY_KINDS.includes(entity.kind) &&
        (entity.status === 'active' ||
          entity.status === 'completed' ||
          entity.status === 'archived') &&
        Number.isFinite(Date.parse(entity.createdAt)) &&
        Number.isFinite(Date.parse(entity.updatedAt))

      if (!isValidEntity) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'An entity creation contains invalid required fields.',
        )
      }

      if (state.entities.some((candidate) => candidate.id === entity.id)) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'The event stream creates the same entity more than once.',
        )
      }

      return {
        ...state,
        entities: [...state.entities, entity],
        events: [...state.events, event],
      }
    }

    case 'relation.created': {
      const { relation } = event.payload
      if (
        !relation.id.trim() ||
        !relation.sourceEntityId.trim() ||
        !relation.targetEntityId.trim() ||
        !Number.isFinite(Date.parse(relation.createdAt))
      ) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A relation creation contains invalid required fields.',
        )
      }
      const source = state.entities.find((entity) => entity.id === relation.sourceEntityId)
      const target = state.entities.find((entity) => entity.id === relation.targetEntityId)

      if (!source || !target || source.kind !== 'project' || target.kind !== 'goal') {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A supports relation must connect an existing project to an existing goal.',
        )
      }

      if (state.relations.some((candidate) => candidate.id === relation.id)) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'The event stream contains a duplicate relation identifier.',
        )
      }

      if (
        state.relations.some(
          (candidate) =>
            candidate.kind === relation.kind &&
            candidate.sourceEntityId === relation.sourceEntityId &&
            candidate.targetEntityId === relation.targetEntityId,
        )
      ) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'The event stream creates the same relation more than once.',
        )
      }

      return {
        ...state,
        relations: [...state.relations, relation],
        events: [...state.events, event],
      }
    }

    case 'session.started': {
      if (!event.payload.sessionId.trim() || !event.payload.projectId.trim()) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A session start contains invalid required fields.',
        )
      }

      const project = state.entities.find(
        (entity) => entity.id === event.payload.projectId && entity.kind === 'project',
      )
      const hasActiveSession = state.sessions.some((session) => !session.stoppedAt)
      const hasSessionId = state.sessions.some(
        (session) => session.id === event.payload.sessionId,
      )

      if (!project || project.status !== 'active' || hasActiveSession || hasSessionId) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A session start must target an active project while no other session is running.',
        )
      }

      return {
        ...state,
        sessions: [
          ...state.sessions,
          {
            id: event.payload.sessionId,
            projectId: event.payload.projectId,
            startedAt: event.occurredAt,
          },
        ],
        events: [...state.events, event],
      }
    }

    case 'session.stopped': {
      if (!event.payload.sessionId.trim() || !event.payload.projectId.trim()) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A session stop contains invalid required fields.',
        )
      }

      const session = state.sessions.find((candidate) => candidate.id === event.payload.sessionId)

      if (
        !session ||
        session.stoppedAt ||
        session.projectId !== event.payload.projectId ||
        Date.parse(event.occurredAt) < Date.parse(session.startedAt)
      ) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A session stop must close the currently running session.',
        )
      }

      return {
        ...state,
        sessions: state.sessions.map(
          (candidate): FocusSession =>
            candidate.id === session.id
              ? { ...candidate, stoppedAt: event.occurredAt }
              : candidate,
        ),
        events: [...state.events, event],
      }
    }

    case 'work.completed': {
      if (!event.payload.projectId.trim()) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A work completion contains an invalid project identifier.',
        )
      }

      const project = state.entities.find(
        (entity) =>
          entity.id === event.payload.projectId && entity.kind === 'project',
      )

      if (!project) {
        throw new DomainError(
          'INVALID_EVENT_STREAM',
          'A work completion must target an existing project.',
        )
      }

      return {
        ...state,
        events: [...state.events, event],
      }
    }
  }
}

export function projectEvents(events: readonly NerveEvent[]): DomainState {
  return events.reduce<DomainState>(applyEvent, EMPTY_DOMAIN_STATE)
}
