import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Entity } from '../domain/types'
import { useNerve } from '../state/useNerve'
import { Icon } from './Icon'

interface RelationDialogProps {
  readonly project: Entity
  readonly goals: readonly Entity[]
  readonly onClose: () => void
}

export function RelationDialog({ project, goals, onClose }: RelationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '')
  const { actions, pending, actionError } = useNerve()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (goalId && (await actions.connectProjectToGoal(project.id, goalId))) {
      dialogRef.current?.close()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="entity-dialog"
      aria-labelledby="relation-dialog-title"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="dialog-heading">
          <div className="dialog-icon" aria-hidden="true">
            <Icon name="link" width="20" height="20" />
          </div>
          <div>
            <p className="eyebrow">CREATE RELATION</p>
            <h2 id="relation-dialog-title">Connect project to goal</h2>
          </div>
        </div>

        <p className="dialog-copy">
          <strong>{project.name}</strong> supports:
        </p>

        <label className="field">
          <span>Goal</span>
          <select
            autoFocus
            value={goalId}
            onChange={(event) => setGoalId(event.target.value)}
            disabled={pending}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </select>
        </label>

        <div className="relation-preview" aria-hidden="true">
          <span>{project.name}</span>
          <span className="relation-line">SUPPORTS</span>
          <span>{goals.find((goal) => goal.id === goalId)?.name}</span>
        </div>

        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        <div className="dialog-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            className="button button--solid"
            type="submit"
            disabled={pending || !goalId}
          >
            <Icon name="link" width="16" height="16" />
            {pending ? 'Connecting…' : 'Create relation'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
