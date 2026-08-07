import type {
  DomainState,
  Entity,
  EntityId,
  EntityKind,
  FocusSession,
  Relation,
} from './types'

export interface SessionSlice {
  readonly session: FocusSession
  readonly start: Date
  readonly end: Date
}

export function selectEntities(state: DomainState, kind: EntityKind): readonly Entity[] {
  return state.entities.filter((entity) => entity.kind === kind)
}

export function selectActiveSession(state: DomainState): FocusSession | undefined {
  return state.sessions.find((session) => !session.stoppedAt)
}

export function selectEntity(state: DomainState, id: EntityId): Entity | undefined {
  return state.entities.find((entity) => entity.id === id)
}

export function selectProjectRelations(
  state: DomainState,
  projectId: EntityId,
): readonly Relation[] {
  return state.relations.filter(
    (relation) =>
      relation.kind === 'supports' && relation.sourceEntityId === projectId,
  )
}

export function selectProjectGoals(
  state: DomainState,
  projectId: EntityId,
): readonly Entity[] {
  const goalIds = new Set(
    selectProjectRelations(state, projectId).map((relation) => relation.targetEntityId),
  )

  return state.entities.filter((entity) => entity.kind === 'goal' && goalIds.has(entity.id))
}

export function getLocalDayBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

export function selectSessionSlicesForDay(
  state: DomainState,
  now: Date,
  projectId?: EntityId,
): readonly SessionSlice[] {
  const { start: dayStart, end: dayEnd } = getLocalDayBounds(now)
  const nowTime = now.getTime()

  return state.sessions.flatMap((session): SessionSlice[] => {
    if (projectId && session.projectId !== projectId) {
      return []
    }

    const sessionStart = new Date(session.startedAt)
    const sessionEnd = session.stoppedAt ? new Date(session.stoppedAt) : now
    const startTime = Math.max(sessionStart.getTime(), dayStart.getTime())
    const endTime = Math.min(sessionEnd.getTime(), dayEnd.getTime(), nowTime)

    if (endTime <= startTime) {
      return []
    }

    return [
      {
        session,
        start: new Date(startTime),
        end: new Date(endTime),
      },
    ]
  })
}

export function selectTrackedTimeForDay(
  state: DomainState,
  now: Date,
  projectId?: EntityId,
): number {
  return selectSessionSlicesForDay(state, now, projectId).reduce(
    (total, slice) => total + slice.end.getTime() - slice.start.getTime(),
    0,
  )
}

export function selectSessionDuration(
  session: FocusSession,
  now: Date,
): number {
  const end = session.stoppedAt ? new Date(session.stoppedAt) : now
  return Math.max(0, end.getTime() - new Date(session.startedAt).getTime())
}
