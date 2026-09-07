import { useState } from 'react'
import {
  selectActiveSession,
  selectEntities,
  selectEntity,
  selectSessionDuration,
  selectSessionSlicesForDay,
  selectTrackedTimeForDay,
} from '../domain/selectors'
import { Button } from '../components/Button'
import { EntityDialog } from '../components/EntityDialog'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { ProjectRow } from '../components/ProjectRow'
import { useClock } from '../hooks/useClock'
import { formatCompactDuration, formatDuration } from '../lib/format'
import { useNerve } from '../state/useNerve'

const DAILY_FOCUS_TARGET_MS = 4 * 60 * 60 * 1_000
const SEGMENT_TONES = ['coding', 'design', 'reading'] as const

export function HomeView() {
  const { state, actions, pending, clearMessages } = useNerve()
  const [createKind, setCreateKind] = useState<'goal' | 'project' | null>(null)
  const activeSession = selectActiveSession(state)
  const projects = selectEntities(state, 'project').filter(
    (project) => project.status === 'active',
  )
  const goals = selectEntities(state, 'goal').filter((goal) => goal.status === 'active')
  const activeProject = activeSession
    ? selectEntity(state, activeSession.projectId)
    : undefined
  const now = useClock(activeSession ? 1000 : 60_000)
  const elapsed = activeSession ? selectSessionDuration(activeSession, now) : 0
  const trackedToday = selectTrackedTimeForDay(state, now)
  const projectAttention = projects
    .map((project) => ({
      project,
      duration: selectTrackedTimeForDay(state, now, project.id),
    }))
    .filter((item) => item.duration > 0)
    .sort((left, right) => right.duration - left.duration)
    .slice(0, 3)
  const attentionScale = Math.max(
    DAILY_FOCUS_TARGET_MS,
    projectAttention.reduce((total, item) => total + item.duration, 0),
  )

  function openCreate(kind: 'goal' | 'project') {
    clearMessages()
    setCreateKind(kind)
  }

  return (
    <>
      <Panel className="focus-panel">
        <h2>Current focus</h2>
        <div className="focus-panel__body">
          <div className="focus-mark" aria-hidden="true">
            {activeProject?.name.charAt(0).toUpperCase() ?? '—'}
          </div>
          <div className="focus-copy">
            <span>{activeSession ? 'Active focus' : 'System idle'}</span>
            <strong>{activeProject?.name ?? 'No active session'}</strong>
            <div className="focus-meta">
              <span><Icon name="focus" />{activeSession ? 'Deep work' : 'Ready'}</span>
              <i aria-hidden="true">·</i>
              <span>{activeProject?.description || 'Choose a project to begin'}</span>
            </div>
          </div>
          <div className="focus-timer">
            <time dateTime={'PT' + Math.floor(elapsed / 1_000) + 'S'}>
              {formatDuration(elapsed)}
            </time>
            {activeSession && (
              <div className="focus-actions">
                <Button variant="solid" disabled={pending} onClick={() => void actions.stopSession()}>
                  <Icon name="finish" />
                  {pending ? 'Ending…' : 'End session'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Panel>

      <section className="attention" aria-labelledby="attention-title">
        <div className="section-title-row">
          <h2 id="attention-title">Today’s focused time</h2>
          <strong>{formatCompactDuration(trackedToday)}</strong>
        </div>
        <div className="attention__times" aria-hidden="true">
          <span>0h</span><span>1h</span><span>2h</span><span>4h target</span>
        </div>
        <div className="attention__bar" aria-label={`${formatCompactDuration(trackedToday)} tracked today`}>
          {projectAttention.map((item, index) => (
            <span
              key={item.project.id}
              className={'attention__segment attention__segment--' + SEGMENT_TONES[index]}
              style={{ width: `${item.duration / attentionScale * 100}%` }}
            />
          ))}
          <span className="attention__segment attention__segment--offline attention__remainder" />
        </div>
        <div className="attention__legend">
          {projectAttention.length ? projectAttention.map((item, index) => (
            <div key={item.project.id}>
              <i className={'attention-dot attention-dot--' + (index === 0 ? 'dark' : index === 1 ? 'mid' : 'light')} aria-hidden="true" />
              <span><strong>{item.project.name}</strong><small>{formatCompactDuration(item.duration)}</small></span>
            </div>
          )) : (
            <p className="attention__empty">Start a project session to build today’s attention record.</p>
          )}
        </div>
      </section>

      <section className="projects-section" aria-labelledby="projects-title">
        <div className="section-title-row">
          <h2 id="projects-title">Active projects</h2>
          <div className="section-actions">
            <Button variant="ghost" onClick={() => openCreate('goal')}><Icon name="goal" />New goal</Button>
            <Button variant="solid" onClick={() => openCreate('project')}><Icon name="plus" />New project</Button>
          </div>
        </div>
        <Panel className="project-list">
          {projects.length ? projects.slice(0, 3).map((project) => {
            const isActive = activeSession?.projectId === project.id
            const unavailable = Boolean(activeSession && !isActive)
            const sessionsToday = selectSessionSlicesForDay(state, now, project.id).length
            const projectTracked = selectTrackedTimeForDay(state, now, project.id)

            return (
              <ProjectRow
                key={project.id}
                name={project.name}
                description={project.description || 'No description'}
                sessions={sessionsToday}
                progress={0}
                barProgress={Math.min(projectTracked / DAILY_FOCUS_TARGET_MS * 100, 100)}
                mark={project.name.charAt(0).toUpperCase()}
                actionLabel={isActive ? (pending ? 'Ending…' : 'End') : unavailable ? 'Busy' : pending ? 'Wait…' : 'Start'}
                active={isActive}
                disabled={pending || unavailable}
                onClick={() => void (isActive ? actions.stopSession() : actions.startSession(project.id))}
              />
            )
          }) : (
            <div className="project-list__empty home-empty-actions">
              <span>No active projects yet.</span>
              <Button variant="solid" onClick={() => openCreate('project')}><Icon name="plus" />Create project</Button>
            </div>
          )}
        </Panel>
      </section>

      <Panel className="home-summary-panel">
        <div><span>Goals</span><strong>{goals.length}</strong></div>
        <div><span>Projects</span><strong>{projects.length}</strong></div>
        <div><span>Sessions today</span><strong>{selectSessionSlicesForDay(state, now).length}</strong></div>
        <a href="#timeline">Open timeline <Icon name="chevron" /></a>
      </Panel>

      {createKind && <EntityDialog kind={createKind} onClose={() => setCreateKind(null)} />}
    </>
  )
}
