import { useState } from 'react'
import {
  getLocalDayBounds,
  selectActiveSession,
  selectEntities,
  selectEntity,
  selectProjectGoals,
  selectSessionDuration,
  selectSessionSlicesForDay,
  selectTrackedTimeForDay,
} from '../domain/selectors'
import type { Entity } from '../domain/types'
import { useClock } from '../hooks/useClock'
import { formatCompactDuration, formatDuration } from '../lib/format'
import { useNerve } from '../state/useNerve'
import { EntityDialog } from '../components/EntityDialog'
import { RelationDialog } from '../components/RelationDialog'
import { Icon } from '../components/Icon'

type EntityDialogKind = 'goal' | 'project' | null

export function NowView() {
  const {
    state,
    actions,
    pending,
    feedback,
    actionError,
    clearMessages,
  } = useNerve()
  const activeSession = selectActiveSession(state)
  const now = useClock(activeSession ? 1000 : 60_000)
  const projects = selectEntities(state, 'project')
  const goals = selectEntities(state, 'goal')
  const activeProject = activeSession
    ? selectEntity(state, activeSession.projectId)
    : undefined
  const [entityDialog, setEntityDialog] = useState<EntityDialogKind>(null)
  const [linkProject, setLinkProject] = useState<Entity | null>(null)
  const activeGoalNames = activeProject
    ? selectProjectGoals(state, activeProject.id)
        .map((goal) => goal.name)
        .join(' · ')
    : ''
  const focusContext = activeProject
    ? activeGoalNames || 'No goal linked'
    : projects.length
      ? 'Start a project from the active list below.'
      : 'Create a project to begin tracking focused time.'

  function openEntityDialog(kind: Exclude<EntityDialogKind, null>) {
    clearMessages()
    setEntityDialog(kind)
  }

  function openRelationDialog(project: Entity) {
    clearMessages()
    setLinkProject(project)
  }

  const availableGoals = linkProject
    ? goals.filter(
        (goal) =>
          !state.relations.some(
            (relation) =>
              relation.sourceEntityId === linkProject.id &&
              relation.targetEntityId === goal.id,
          ),
      )
    : []

  return (
    <>
      {(feedback || actionError) && !entityDialog && !linkProject && (
        <div
          className={actionError ? 'action-notice action-notice--error' : 'action-notice'}
          role={actionError ? 'alert' : 'status'}
        >
          <span>{actionError || feedback}</span>
          <button type="button" onClick={clearMessages} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <div className="now-layout">
        <div className="now-primary">
          <section className="panel focus-panel" aria-labelledby="current-focus-heading">
            <div className="focus-copy">
              <p className="eyebrow" id="current-focus-heading">CURRENT FOCUS</p>
              <h2 title={activeProject?.name}>{activeProject?.name ?? 'System idle'}</h2>
              <p title={focusContext}>{focusContext}</p>
            </div>

            <div className="focus-readout">
              <time
                className="focus-timer"
                dateTime={
                  activeSession
                    ? 'PT' + Math.floor(selectSessionDuration(activeSession, now) / 1000) + 'S'
                    : 'PT0S'
                }
              >
                {activeSession
                  ? formatDuration(selectSessionDuration(activeSession, now))
                  : '00:00:00'}
              </time>
              {activeSession ? (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => void actions.stopSession()}
                  disabled={pending}
                >
                  <Icon name="stop" width="15" height="15" />
                  {pending ? 'Ending…' : 'End session'}
                </button>
              ) : (
                <span className="idle-code">NO SESSION RUNNING</span>
              )}
            </div>
          </section>

          <AttentionPanel state={state} now={now} />

          <section className="panel table-panel" aria-labelledby="active-projects-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">WORK IN MOTION</p>
                <h2 id="active-projects-heading">Active projects</h2>
              </div>
              <span className="panel-count">{projects.length} ACTIVE</span>
            </div>

            {projects.length ? (
              <div className="data-table" role="table" aria-label="Active projects">
                <div className="data-row data-row--header" role="row">
                  <span role="columnheader">Project</span>
                  <span role="columnheader">Goal</span>
                  <span role="columnheader">Today</span>
                  <span role="columnheader">Action</span>
                </div>
                {projects.map((project) => {
                  const linkedGoals = selectProjectGoals(state, project.id)
                  const isActive = activeSession?.projectId === project.id
                  const unavailable = Boolean(activeSession && !isActive)

                  return (
                    <div className="data-row" role="row" key={project.id}>
                      <div className="project-cell" role="cell" data-label="Project">
                        <span className="entity-mark" aria-hidden="true">P</span>
                        <div>
                          <strong title={project.name}>{project.name}</strong>
                          {project.description && (
                            <small title={project.description}>{project.description}</small>
                          )}
                        </div>
                      </div>
                      <div role="cell" data-label="Goal">
                        {linkedGoals.length ? (
                          <span className="linked-goal">
                            <Icon name="link" width="14" height="14" />
                            {linkedGoals.map((goal) => goal.name).join(', ')}
                          </span>
                        ) : goals.length ? (
                          <button
                            className="text-action"
                            type="button"
                            onClick={() => openRelationDialog(project)}
                          >
                            Unlinked — link goal
                          </button>
                        ) : (
                          <span className="muted-code">CREATE GOAL FIRST</span>
                        )}
                      </div>
                      <time role="cell" data-label="Today">
                        {formatCompactDuration(
                          selectTrackedTimeForDay(state, now, project.id),
                        )}
                      </time>
                      <div role="cell" data-label="Action">
                        {unavailable ? (
                          <span className="occupied-note">Active elsewhere</span>
                        ) : (
                          <button
                            className={isActive ? 'row-action row-action--active' : 'row-action'}
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              void (isActive
                                ? actions.stopSession()
                                : actions.startSession(project.id))
                            }
                          >
                            {isActive ? 'End' : 'Start'}
                            {!isActive && <Icon name="arrow" width="14" height="14" />}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-region">
                <span className="empty-index">02</span>
                <div>
                  <h3>No active projects</h3>
                  <p>Create a project, connect it to a goal, then start a focus session.</p>
                </div>
              </div>
            )}

            <button
              className="panel-footer-action"
              type="button"
              onClick={() => openEntityDialog('project')}
            >
              <Icon name="plus" width="17" height="17" />
              New project
            </button>
          </section>
        </div>

        <aside className="now-context" aria-label="Goals and system sequence">
          <section className="panel goals-panel" aria-labelledby="goals-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">DIRECTION</p>
                <h2 id="goals-heading">Goals</h2>
              </div>
              <span className="panel-count">{goals.length}</span>
            </div>

            {goals.length ? (
              <ul className="entity-list">
                {goals.map((goal) => {
                  const supportingProjects = state.relations.filter(
                    (relation) => relation.targetEntityId === goal.id,
                  ).length

                  return (
                    <li key={goal.id}>
                      <span className="entity-mark entity-mark--goal" aria-hidden="true">G</span>
                      <div>
                        <strong title={goal.name}>{goal.name}</strong>
                        <small>
                          {supportingProjects}{' '}
                          {supportingProjects === 1 ? 'project' : 'projects'} connected
                        </small>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="empty-goal">
                <span className="empty-index">01</span>
                <p>No goals yet. Start by naming an outcome.</p>
              </div>
            )}

            <button
              className="panel-footer-action"
              type="button"
              onClick={() => openEntityDialog('goal')}
            >
              <Icon name="plus" width="17" height="17" />
              New goal
            </button>
          </section>

          <section className="panel sequence-panel" aria-labelledby="sequence-heading">
            <p className="eyebrow">SYSTEM SEQUENCE</p>
            <h2 id="sequence-heading">Build one living thread</h2>
            <ol className="sequence-list">
              <li className={goals.length ? 'is-complete' : ''}>
                <span>01</span>
                <div>
                  <strong>Create goal</strong>
                  <small>Define direction</small>
                </div>
              </li>
              <li className={projects.length ? 'is-complete' : ''}>
                <span>02</span>
                <div>
                  <strong>Create project</strong>
                  <small>Define the work</small>
                </div>
              </li>
              <li className={state.relations.length ? 'is-complete' : ''}>
                <span>03</span>
                <div>
                  <strong>Link the system</strong>
                  <small>Project supports goal</small>
                </div>
              </li>
            </ol>
          </section>

          <section className="panel pulse-panel">
            <p className="eyebrow">UNIFIED LOG</p>
            <div className="pulse-value">{state.events.length.toString().padStart(3, '0')}</div>
            <p>Every entity, relation, and session is rebuilt from this event stream.</p>
            <a href="#timeline" className="inline-link">
              Inspect timeline <Icon name="arrow" width="15" height="15" />
            </a>
          </section>
        </aside>
      </div>

      {entityDialog && (
        <EntityDialog kind={entityDialog} onClose={() => setEntityDialog(null)} />
      )}
      {linkProject && availableGoals.length > 0 && (
        <RelationDialog
          project={linkProject}
          goals={availableGoals}
          onClose={() => setLinkProject(null)}
        />
      )}
    </>
  )
}

function AttentionPanel({
  state,
  now,
}: {
  readonly state: ReturnType<typeof useNerve>['state']
  readonly now: Date
}) {
  const slices = selectSessionSlicesForDay(state, now)
  const total = selectTrackedTimeForDay(state, now)
  const { start, end } = getLocalDayBounds(now)
  const dayDuration = end.getTime() - start.getTime()

  return (
    <section className="panel attention-panel" aria-labelledby="attention-heading">
      <div className="attention-title">
        <div>
          <p className="eyebrow">TODAY'S ATTENTION</p>
          <h2 id="attention-heading">Focus signal</h2>
        </div>
        <div className="attention-total">
          <span>Total tracked</span>
          <strong>{formatDuration(total)}</strong>
        </div>
      </div>

      <div className="attention-axis" aria-hidden="true">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
      <div className="attention-row">
        <span className="attention-label">FOCUS</span>
        <div className="attention-track">
          <span className="track-line" />
          {slices.map((slice) => {
            const left =
              ((slice.start.getTime() - start.getTime()) / dayDuration) * 100
            const width =
              ((slice.end.getTime() - slice.start.getTime()) / dayDuration) * 100

            return (
              <span
                key={slice.session.id}
                className={
                  slice.session.stoppedAt
                    ? 'session-segment'
                    : 'session-segment session-segment--live'
                }
                style={{
                  left: String(left) + '%',
                  width: String(Math.max(width, 0.35)) + '%',
                }}
                title={formatDuration(slice.end.getTime() - slice.start.getTime())}
              />
            )
          })}
        </div>
      </div>
      <p className="attention-caption">
        {slices.length
          ? String(slices.length) + (slices.length === 1 ? ' interval' : ' intervals') + ' recorded today'
          : 'No focus intervals recorded today'}
      </p>
    </section>
  )
}
