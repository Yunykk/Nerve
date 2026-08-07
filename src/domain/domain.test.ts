import { describe, expect, it } from 'vitest'
import {
  createEntityEvent,
  createRelationEvent,
  createSessionStartedEvent,
} from './commands'
import { DomainError } from './errors'
import { NerveStore } from './NerveStore'
import { applyEvent, projectEvents } from './projector'
import {
  selectActiveSession,
  selectSessionSlicesForDay,
  selectTrackedTimeForDay,
} from './selectors'
import { EMPTY_DOMAIN_STATE, type DomainState, type NerveEvent } from './types'
import { MemoryEventStorage } from '../storage/MemoryEventStorage'

function addEntity(
  state: DomainState,
  kind: 'goal' | 'project',
  id: string,
  occurredAt = '2026-08-04T08:00:00.000Z',
): DomainState {
  return applyEvent(
    state,
    createEntityEvent(
      state,
      { id, kind, name: kind + ' ' + id },
      { eventId: 'event-' + id, occurredAt },
    ),
  )
}

describe('entity and relation events', () => {
  it('creates a goal, a project, and their supports relation by replaying events', () => {
    let state = addEntity(EMPTY_DOMAIN_STATE, 'goal', 'goal-1')
    state = addEntity(state, 'project', 'project-1')
    const relationEvent = createRelationEvent(
      state,
      'project-1',
      'goal-1',
      'relation-1',
      {
        eventId: 'event-relation-1',
        occurredAt: '2026-08-04T08:02:00.000Z',
      },
    )
    state = applyEvent(state, relationEvent)

    expect(state.entities).toHaveLength(2)
    expect(state.relations).toEqual([
      expect.objectContaining({
        kind: 'supports',
        sourceEntityId: 'project-1',
        targetEntityId: 'goal-1',
      }),
    ])
    expect(state.events.map((event) => event.type)).toEqual([
      'entity.created',
      'entity.created',
      'relation.created',
    ])
    expect(projectEvents(state.events)).toEqual(state)
  })

  it('rejects reversed and duplicate relations without changing state', () => {
    let state = addEntity(EMPTY_DOMAIN_STATE, 'goal', 'goal-1')
    state = addEntity(state, 'project', 'project-1')

    expect(() =>
      createRelationEvent(state, 'goal-1', 'project-1', 'bad-relation', {
        eventId: 'bad-event',
        occurredAt: '2026-08-04T08:02:00.000Z',
      }),
    ).toThrowError(DomainError)

    const event = createRelationEvent(
      state,
      'project-1',
      'goal-1',
      'relation-1',
      {
        eventId: 'relation-event',
        occurredAt: '2026-08-04T08:03:00.000Z',
      },
    )
    const linkedState = applyEvent(state, event)

    expect(() =>
      createRelationEvent(
        linkedState,
        'project-1',
        'goal-1',
        'relation-2',
        {
          eventId: 'relation-event-2',
          occurredAt: '2026-08-04T08:04:00.000Z',
        },
      ),
    ).toThrowError(expect.objectContaining({ code: 'DUPLICATE_RELATION' }))
    expect(linkedState.events).toHaveLength(3)
  })

  it('rejects shape-valid events with blank required domain fields', () => {
    const validEvent = createEntityEvent(
      EMPTY_DOMAIN_STATE,
      { id: 'goal-1', kind: 'goal', name: 'Direction' },
      { eventId: 'event-1', occurredAt: '2026-08-04T08:00:00.000Z' },
    )
    const invalidEvent: NerveEvent = {
      ...validEvent,
      payload: {
        entity: {
          ...validEvent.payload.entity,
          name: '   ',
        },
      },
    }

    expect(() => projectEvents([invalidEvent])).toThrowError(
      expect.objectContaining({ code: 'INVALID_EVENT_STREAM' }),
    )
  })
})

describe('focus session event logic', () => {
  it('starts and stops exactly one global focus session', async () => {
    let now = new Date('2026-08-04T09:00:00.000Z')
    let id = 0
    const storage = new MemoryEventStorage()
    const store = new NerveStore(storage, {
      clock: () => now,
      idGenerator: () => 'id-' + String(++id),
    })

    await store.initialize()
    const first = await store.createEntity('project', 'Nerve')
    const second = await store.createEntity('project', 'Writing')
    await store.startSession(first.id)

    expect(selectActiveSession(store.getState())?.projectId).toBe(first.id)
    await expect(store.startSession(second.id)).rejects.toMatchObject({
      code: 'SESSION_ALREADY_ACTIVE',
    })
    expect(store.getState().events).toHaveLength(3)

    now = new Date('2026-08-04T09:42:18.000Z')
    await store.stopSession()

    expect(selectActiveSession(store.getState())).toBeUndefined()
    expect(store.getState().events.map((event) => event.type)).toEqual([
      'entity.created',
      'entity.created',
      'session.started',
      'session.stopped',
    ])
    expect(selectTrackedTimeForDay(store.getState(), now)).toBe(42 * 60_000 + 18_000)
    await expect(store.stopSession()).rejects.toMatchObject({
      code: 'NO_ACTIVE_SESSION',
    })
    expect(store.getState().events).toHaveLength(4)
  })

  it('clips a session crossing midnight to the local day and includes active time', () => {
    const previousNight = new Date(2026, 7, 3, 23, 30)
    const midnightStop = new Date(2026, 7, 4, 0, 30)
    const activeStart = new Date(2026, 7, 4, 10, 0)
    const now = new Date(2026, 7, 4, 10, 45)
    let state = addEntity(
      EMPTY_DOMAIN_STATE,
      'project',
      'project-1',
      previousNight.toISOString(),
    )

    const events: readonly NerveEvent[] = [
      createSessionStartedEvent(state, 'project-1', 'session-night', {
        eventId: 'start-night',
        occurredAt: previousNight.toISOString(),
      }),
      {
        id: 'stop-night',
        type: 'session.stopped',
        occurredAt: midnightStop.toISOString(),
        payload: { sessionId: 'session-night', projectId: 'project-1' },
      },
      {
        id: 'start-active',
        type: 'session.started',
        occurredAt: activeStart.toISOString(),
        payload: { sessionId: 'session-active', projectId: 'project-1' },
      },
    ]

    state = events.reduce(applyEvent, state)

    expect(selectSessionSlicesForDay(state, now)).toHaveLength(2)
    expect(selectTrackedTimeForDay(state, now)).toBe(75 * 60_000)
  })

  it('replay is deterministic and does not mutate the source event array', () => {
    const state = addEntity(EMPTY_DOMAIN_STATE, 'project', 'project-1')
    const source = [...state.events]
    const frozen = Object.freeze([...source])

    const firstProjection = projectEvents(frozen)
    const secondProjection = projectEvents(frozen)

    expect(firstProjection).toEqual(secondProjection)
    expect(frozen).toEqual(source)
    expect(state.entities).toHaveLength(1)
  })
})

describe('work completion event contract', () => {
  it('records completed work for an existing project and rejects missing projects', async () => {
    let id = 0
    const store = new NerveStore(new MemoryEventStorage(), {
      clock: () => new Date('2026-08-04T12:00:00.000Z'),
      idGenerator: () => 'work-id-' + String(++id),
    })

    await store.initialize()
    const project = await store.createEntity('project', 'Nerve')
    await store.completeWork(project.id, 'Phase 1 event model')

    expect(store.getState().events.at(-1)).toMatchObject({
      type: 'work.completed',
      payload: {
        projectId: project.id,
        note: 'Phase 1 event model',
      },
    })

    await expect(store.completeWork('missing-project')).rejects.toMatchObject({
      code: 'ENTITY_NOT_FOUND',
    })
    expect(store.getState().events).toHaveLength(2)
  })
})
