import {
  selectActiveSession,
  selectEntities,
  selectEntity,
  selectProjectGoals,
  selectSessionDuration,
  selectTrackedTimeForDay,
} from '../domain/selectors'
import { useClock } from '../hooks/useClock'
import { formatCompactDuration, formatDuration, formatTimelineTime } from '../lib/format'
import { useNerve } from '../state/useNerve'
import { Icon } from './Icon'
import { Panel } from './Panel'

export function RightRail() {
  const { state } = useNerve()
  const activeSession = selectActiveSession(state)
  const now = useClock(activeSession ? 1000 : 60_000)
  const activeProject = activeSession ? selectEntity(state, activeSession.projectId) : undefined
  const activeGoals = activeProject ? selectProjectGoals(state, activeProject.id) : []
  const recentEvents = [...state.events].reverse().slice(0, 4)

  return (
    <Panel as="aside" className="right-rail" aria-label="System summary">
      <h2>Now</h2>

      <section className="rail-section rail-section--next">
        <div className="rail-heading"><Icon name="focus" /><h3>Current focus</h3></div>
        <div className="rail-fact">
          <strong>{activeProject?.name ?? 'No session running'}</strong>
          <small>{activeSession ? formatDuration(selectSessionDuration(activeSession, now)) : 'Ready when you are'}</small>
        </div>
      </section>

      <section className="rail-section rail-section--context">
        <div className="rail-heading"><Icon name="goal" /><h3>Direction</h3></div>
        <div className="context-chips">
          {activeGoals.length ? activeGoals.map((goal) => <span key={goal.id}>{goal.name}</span>) : <span>No linked goal</span>}
        </div>
      </section>

      <section className="rail-section rail-section--devices">
        <div className="rail-heading"><Icon name="timeline" /><h3>Today</h3></div>
        <div className="rail-stats">
          <div><strong>{formatCompactDuration(selectTrackedTimeForDay(state, now))}</strong><small>Focused time</small></div>
          <div><strong>{selectEntities(state, 'project').length}</strong><small>Projects</small></div>
          <div><strong>{selectEntities(state, 'goal').length}</strong><small>Goals</small></div>
        </div>
      </section>

      <section className="rail-section rail-section--people">
        <div className="rail-heading"><Icon name="list" /><h3>Recent activity</h3></div>
        {recentEvents.length ? (
          <ol className="rail-events">
            {recentEvents.map((event) => (
              <li key={event.id}>
                <span>{eventLabel(event.type)}</span>
                <time dateTime={event.occurredAt}>{formatTimelineTime(event.occurredAt)}</time>
              </li>
            ))}
          </ol>
        ) : <p className="rail-empty">Your first event will appear here.</p>}
        <a className="relationship-link" href="#timeline">
          <Icon name="timeline" /><span>View full timeline</span><Icon name="chevron" />
        </a>
      </section>
    </Panel>
  )
}

function eventLabel(type: string): string {
  switch (type) {
    case 'entity.created': return 'Entity created'
    case 'relation.created': return 'Goal linked'
    case 'session.started': return 'Focus started'
    case 'session.stopped': return 'Focus ended'
    case 'work.completed': return 'Work completed'
    default: return 'Activity recorded'
  }
}
