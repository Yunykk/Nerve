import { useState } from 'react'
import { Button } from '../components/Button'
import { EntityDialog } from '../components/EntityDialog'
import { Icon } from '../components/Icon'
import { selectEntities } from '../domain/selectors'
import { useNerve } from '../state/useNerve'

export function ProjectsView() {
  const { state, clearMessages } = useNerve()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const projects = selectEntities(state, 'project')

  function openCreateDialog() {
    clearMessages()
    setIsCreateOpen(true)
  }

  return (
    <>
      <section
        className="projects-view"
        aria-labelledby="projects-page-title"
      >
        <header className="projects-view__intro">
          <div>
            <h1 id="projects-page-title">Projects</h1>
          </div>

          <Button variant="solid" onClick={openCreateDialog}>
            <Icon name="plus" />
            New project
          </Button>
        </header>

        {projects.length > 0 ? (
        <ul className="projects-view__list">
          {projects.map((project) => (
            <li className="projects-view__item" key={project.id}>
              <span className="projects-view__mark" aria-hidden="true">
                {project.name.charAt(0).toUpperCase()}
              </span>

              <div className="projects-view__project-copy">
                <h2>{project.name}</h2>
                <p>{project.description || 'No description'}</p>
              </div>

              <span className="projects-view__status">
                {project.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="projects-view__empty">
          <h2>No projects yet</h2>
          <p>Create your first project to start tracking focused work.</p>
        </div>
      )}

      <p className="projects-view__count">
        {projects.length}{' '}
        {projects.length === 1 ? 'project' : 'projects'}
      </p>
      </section>

      {isCreateOpen && (
        <EntityDialog
          kind="project"
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </>
  )
}
