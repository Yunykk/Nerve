import { describe, expect, it } from 'vitest'
import { createEntityEvent } from '../domain/commands'
import { NerveStore } from '../domain/NerveStore'
import { projectEvents } from '../domain/projector'
import { selectActiveSession } from '../domain/selectors'
import { EMPTY_DOMAIN_STATE } from '../domain/types'
import { EventStorageError } from './EventStorage'
import {
  LOCAL_EVENT_STORAGE_KEY,
  LocalEventStorage,
} from './LocalEventStorage'

class FakeStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

describe('LocalEventStorage', () => {
  it('preserves append order across a storage round trip', async () => {
    const browserStorage = new FakeStorage()
    const storage = new LocalEventStorage(browserStorage)
    const first = createEntityEvent(
      EMPTY_DOMAIN_STATE,
      { id: 'goal-1', kind: 'goal', name: 'Direction' },
      { eventId: 'event-1', occurredAt: '2026-08-04T08:00:00.000Z' },
    )
    const second = createEntityEvent(
      EMPTY_DOMAIN_STATE,
      { id: 'project-1', kind: 'project', name: 'Nerve' },
      { eventId: 'event-2', occurredAt: '2026-08-04T08:01:00.000Z' },
    )

    await storage.append([first])
    await storage.append([second])

    const reloaded = new LocalEventStorage(browserStorage)
    expect((await reloaded.load()).map((event) => event.id)).toEqual([
      'event-1',
      'event-2',
    ])
  })

  it('reports corrupt data without deleting or replacing it', async () => {
    const browserStorage = new FakeStorage()
    browserStorage.setItem(LOCAL_EVENT_STORAGE_KEY, '{not valid json')
    const storage = new LocalEventStorage(browserStorage)

    await expect(storage.load()).rejects.toBeInstanceOf(EventStorageError)
    expect(browserStorage.getItem(LOCAL_EVENT_STORAGE_KEY)).toBe('{not valid json')
  })

  it('rejects unsupported schema versions', async () => {
    const browserStorage = new FakeStorage()
    browserStorage.setItem(
      LOCAL_EVENT_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 2, events: [] }),
    )
    const storage = new LocalEventStorage(browserStorage)

    await expect(storage.load()).rejects.toThrow('unsupported or invalid schema')
  })

  it('rejects shape-valid documents with blank required fields', async () => {
    const browserStorage = new FakeStorage()
    browserStorage.setItem(
      LOCAL_EVENT_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        events: [
          {
            id: 'event-1',
            type: 'entity.created',
            occurredAt: '2026-08-04T08:00:00.000Z',
            payload: {
              entity: {
                id: '',
                kind: 'goal',
                name: '',
                description: '',
                status: 'active',
                createdAt: '2026-08-04T08:00:00.000Z',
                updatedAt: '2026-08-04T08:00:00.000Z',
              },
            },
          },
        ],
      }),
    )

    await expect(new LocalEventStorage(browserStorage).load()).rejects.toThrow(
      'unsupported or invalid schema',
    )
  })

  it('rejects a stale-tab command before it can corrupt the stored stream', async () => {
    const browserStorage = new FakeStorage()
    let bootstrapId = 0
    const bootstrap = new NerveStore(new LocalEventStorage(browserStorage), {
      clock: () => new Date('2026-08-04T08:00:00.000Z'),
      idGenerator: () => 'bootstrap-' + String(++bootstrapId),
    })
    await bootstrap.initialize()
    const firstProject = await bootstrap.createEntity('project', 'Nerve')
    const secondProject = await bootstrap.createEntity('project', 'Writing')

    let firstTabId = 0
    let secondTabId = 0
    const firstTab = new NerveStore(new LocalEventStorage(browserStorage), {
      clock: () => new Date('2026-08-04T09:00:00.000Z'),
      idGenerator: () => 'first-tab-' + String(++firstTabId),
    })
    const staleSecondTab = new NerveStore(new LocalEventStorage(browserStorage), {
      clock: () => new Date('2026-08-04T09:00:01.000Z'),
      idGenerator: () => 'second-tab-' + String(++secondTabId),
    })

    await Promise.all([firstTab.initialize(), staleSecondTab.initialize()])
    await firstTab.startSession(firstProject.id)
    await expect(staleSecondTab.startSession(secondProject.id)).rejects.toMatchObject({
      code: 'INVALID_EVENT_STREAM',
    })

    const persisted = await new LocalEventStorage(browserStorage).load()
    const projection = projectEvents(persisted)
    expect(persisted).toHaveLength(3)
    expect(selectActiveSession(projection)?.projectId).toBe(firstProject.id)
  })
})
