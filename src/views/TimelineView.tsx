import { Fragment } from 'react'
import { selectEntity, selectSessionDuration } from '../domain/selectors'
import type { DomainState, NerveEvent } from '../domain/types'
import {
  formatDuration,
  formatTimelineDate,
  formatTimelineTime,
} from '../lib/format'
import { useNerve } from '../state/useNerve'
import { Icon } from '../components/Icon'
import { useClock } from '../hooks/useClock'

interface EventPresentation {
  readonly code: string
  readonly title: string
  readonly context: string
}

function presentEvent(event: NerveEvent, state: DomainState): EventPresentation {
  switch (event.type) {
    case 'entity.created': {
      const { entity } = event.payload
      const kind = entity.kind.charAt(0).toUpperCase() + entity.kind.slice(1)
      return {
        code: 'ENT / CREATE',
        title: kind + ' created',
        context: entity.name,
      }
    }

    case 'relation.created': {
      const { relation } = event.payload
      const project = selectEntity(state, relation.sourceEntityId)
      const goal = selectEntity(state, relation.targetEntityId)
      return {
        code: 'REL / SUPPORTS',
        title: 'Project connected to goal',
        context:
          (project?.name ?? 'Unknown project') +
          ' → ' +
          (goal?.name ?? 'Unknown goal'),
      }
    }

    case 'session.started': {
      const project = selectEntity(state, event.payload.projectId)
      return {
        code: 'SES / START',
        title: 'Focus session started',
        context: project?.name ?? 'Unknown project',
      }
    }

    case 'session.stopped': {
      const project = selectEntity(state, event.payload.projectId)
      const session = state.sessions.find(
        (candidate) => candidate.id === event.payload.sessionId,
      )
      return {
        code: 'SES / STOP',
        title:
          'Focus session stopped' +
          (session
            ? ' · ' + formatDuration(selectSessionDuration(session, new Date(event.occurredAt)))
            : ''),
        context: project?.name ?? 'Unknown project',
      }
    }

    case 'work.completed': {
      const project = selectEntity(state, event.payload.projectId)
      return {
        code: 'WORK / DONE',
        title: 'Work completed',
        context: event.payload.note || project?.name || 'Project work',
      }
    }
  }
}

function localDateKey(value: string): string {
  const date = new Date(value)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function TimelineView() {
  const { state } = useNerve()
  const now = useClock(60_000)
  const events = [...state.events].reverse()

  return (
    <section className="panel timeline-panel" aria-labelledby="timeline-heading">
      <div className="panel-heading timeline-heading">
        <div>
          <p className="eyebrow">IMMUTABLE LOCAL HISTORY</p>
          <h2 id="timeline-heading">Unified event log</h2>
        </div>
        <span className="panel-count">NEWEST FIRST</span>
      </div>

      {events.length ? (
        <>
          <div className="timeline-columns" aria-hidden="true">
            <span>Time</span>
            <span>Event</span>
            <span>Context</span>
          </div>
          <ol className="timeline-list">
            {events.map((event, index) => {
              const dateKey = localDateKey(event.occurredAt)
              const previousEvent = index > 0 ? events[index - 1] : undefined
              const showDate =
                !previousEvent || dateKey !== localDateKey(previousEvent.occurredAt)
              const presentation = presentEvent(event, state)

              return (
                <Fragment key={event.id}>
                  {showDate && (
                    <li className="timeline-date">
                      <span>{formatTimelineDate(event.occurredAt, now)}</span>
                      <span>{dateKey}</span>
                    </li>
                  )}
                  <li className="timeline-event">
                    <time dateTime={event.occurredAt}>
                      {formatTimelineTime(event.occurredAt)}
                    </time>
                    <div className="event-main">
                      <span className="event-dot" aria-hidden="true" />
                      <div>
                        <strong title={presentation.title}>{presentation.title}</strong>
                        <code>{presentation.code}</code>
                      </div>
                    </div>
                    <div className="event-context">{presentation.context}</div>
                  </li>
                </Fragment>
              )
            })}
          </ol>
        </>
      ) : (
        <div className="timeline-empty">
          <span className="empty-index">000</span>
          <div>
            <h3>The event stream is quiet.</h3>
            <p>
              Create your first goal on NOW. Every following entity, relation, and
              session transition will appear here.
            </p>
            <a className="button button--solid" href="#home">
              Open Home <Icon name="arrow" width="16" height="16" />
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
