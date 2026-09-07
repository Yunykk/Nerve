import { useState } from 'react'
import { Button } from '../components/Button'
import { EntityDialog } from '../components/EntityDialog'
import { Icon } from '../components/Icon'
import { RelationDialog } from '../components/RelationDialog'
import {
  selectActiveSession,
  selectEntities,
  selectProjectGoals,
  selectSessionSlicesForDay,
  selectTrackedTimeForDay,
} from '../domain/selectors'
import type { Entity } from '../domain/types'
import { useClock } from '../hooks/useClock'
import { formatCompactDuration } from '../lib/format'
import { useNerve } from '../state/useNerve'

export function ProjectsView() {
  const { state, actions, pending, feedback, actionError, clearMessages } = useNerve()
  const [createKind, setCreateKind] = useState<'goal' | 'project' | null>(null)
  const [linkProject, setLinkProject] = useState<Entity | null>(null)
  const [query, setQuery] = useState('')
  const now = useClock(selectActiveSession(state) ? 1000 : 60_000)
  const activeSession = selectActiveSession(state)
  const goals = selectEntities(state, 'goal').filter((goal) => goal.status === 'active')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const projects = selectEntities(state, 'project').filter(
    (project) =>
      project.status === 'active' &&
      (!normalizedQuery ||
        project.name.toLocaleLowerCase().includes(normalizedQuery) ||
        project.description.toLocaleLowerCase().includes(normalizedQuery)),
  )
  const availableGoals = linkProject
    ? goals.filter(
        (goal) => !state.relations.some(
          (relation) =>
            relation.sourceEntityId === linkProject.id &&
            relation.targetEntityId === goal.id,
        ),
      )
    : []

  function openCreate(kind: 'goal' | 'project') {
    clearMessages()
    setCreateKind(kind)
  }

  function openLink(project: Entity) {
    clearMessages()
    setLinkProject(project)
  }

  return (
    <>
      {(feedback || actionError) && !createKind && !linkProject && (
        <div className={actionError ? 'page-notice page-notice--error' : 'page-notice'} role={actionError ? 'alert' : 'status'}>
          <span>{actionError || feedback}</span>
          <button type="button" onClick={clearMessages} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className="projects-view" aria-labelledby="projects-page-title">
        <header className="projects-view__intro">
          <label className="project-search">
            <Icon name="search" />
            <span className="sr-only">Filter projects</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter projects"
            />
          </label>
          <div className="projects-view__actions">
            <Button onClick={() => openCreate('goal')}><Icon name="goal" />New goal</Button>
            <Button variant="solid" onClick={() => openCreate('project')}><Icon name="plus" />New project</Button>
          </div>
        </header>

        <div className="goal-strip" aria-label="Active goals">
          <span>Goals</span>
          {goals.length ? goals.map((goal) => (
            <span className="goal-chip" key={goal.id}>{goal.name}</span>
          )) : (
            <button type="button" onClick={() => openCreate('goal')}>Create the first goal</button>
          )}
        </div>

        {projects.length ? (
          <ul className="projects-view__list">
            {projects.map((project) => {
              const linkedGoals = selectProjectGoals(state, project.id)
              const isActive = activeSession?.projectId === project.id
              const unavailable = Boolean(activeSession && !isActive)
              const canLink = goals.length > linkedGoals.length

              return (
                <li className={'projects-view__item' + (isActive ? ' is-active' : '')} key={project.id}>
                  <span className="projects-view__mark" aria-hidden="true">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="projects-view__project-copy">
                    <h2>{project.name}</h2>
                    <p>{project.description || 'No description'}</p>
                    <div className="project-goals">
                      {linkedGoals.length ? linkedGoals.map((goal) => (
                        <span key={goal.id}><Icon name="link" />{goal.name}</span>
                      )) : <span className="project-goals__empty">No goal linked</span>}
                    </div>
                  </div>
                  <div className="project-metrics">
                    <strong>{formatCompactDuration(selectTrackedTimeForDay(state, now, project.id))}</strong>
                    <span>{selectSessionSlicesForDay(state, now, project.id).length} sessions today</span>
                  </div>
                  <div className="project-card-actions">
                    {canLink && (
                      <Button variant="outline" onClick={() => openLink(project)}>
                        <Icon name="link" />Link goal
                      </Button>
                    )}
                    <Button
                      variant={isActive ? 'outline' : 'solid'}
                      disabled={pending || unavailable}
                      onClick={() => void (isActive ? actions.stopSession() : actions.startSession(project.id))}
                    >
                      <Icon name={isActive ? 'finish' : 'focus'} />
                      {isActive ? 'End focus' : unavailable ? 'Focus active' : 'Start focus'}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="projects-view__empty">
            <h2>{normalizedQuery ? 'No matching projects' : 'No projects yet'}</h2>
            <p>{normalizedQuery ? 'Try another name or description.' : 'Create your first project to start tracking focused work.'}</p>
            {!normalizedQuery && <Button variant="solid" onClick={() => openCreate('project')}><Icon name="plus" />Create project</Button>}
          </div>
        )}

        <p className="projects-view__count">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </p>
      </section>

      {createKind && <EntityDialog kind={createKind} onClose={() => setCreateKind(null)} />}
      {linkProject && availableGoals.length > 0 && (
        <RelationDialog project={linkProject} goals={availableGoals} onClose={() => setLinkProject(null)} />
      )}
      {linkProject && availableGoals.length === 0 && (
        <dialog className="entity-dialog" open aria-labelledby="no-goals-title">
          <div className="simple-dialog">
            <h2 id="no-goals-title">No goals available</h2>
            <p>Create another goal before adding a new relation to {linkProject.name}.</p>
            <div className="dialog-actions">
              <Button onClick={() => setLinkProject(null)}>Close</Button>
              <Button variant="solid" onClick={() => { setLinkProject(null); openCreate('goal') }}>Create goal</Button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
