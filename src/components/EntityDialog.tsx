import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { EntityKind } from '../domain/types'
import { useNerve } from '../state/useNerve'
import { Icon } from './Icon'

interface EntityDialogProps {
  readonly kind: Extract<EntityKind, 'goal' | 'project'>
  readonly onClose: () => void
}

export function EntityDialog({ kind, onClose }: EntityDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [localError, setLocalError] = useState('')
  const { actions, pending, actionError } = useNerve()
  const title = kind === 'goal' ? 'Create a goal' : 'Create a project'

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (!name.trim()) {
      setLocalError('Name is required.')
      return
    }

    if (await actions.createEntity(kind, name, description)) {
      dialogRef.current?.close()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="entity-dialog"
      aria-labelledby="entity-dialog-title"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="dialog-heading">
          <div className="dialog-icon" aria-hidden="true">
            <Icon name={kind} width="20" height="20" />
          </div>
          <div>
            <p className="eyebrow">ADD TO SYSTEM</p>
            <h2 id="entity-dialog-title">{title}</h2>
          </div>
        </div>

        <p className="dialog-copy">
          {kind === 'goal'
            ? 'Name the outcome this system should move toward.'
            : 'Create a concrete body of work. You can link it to a goal next.'}
        </p>

        <label className="field">
          <span>Name</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={kind === 'goal' ? 'Build a calmer life' : 'Launch Nerve'}
            maxLength={80}
            disabled={pending}
          />
        </label>

        <label className="field">
          <span>Description <em>optional</em></span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A short definition of what this means."
            maxLength={240}
            rows={3}
            disabled={pending}
          />
        </label>

        {(localError || actionError) && (
          <p className="form-error" role="alert">
            {localError || actionError}
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
          <button className="button button--primary" type="submit" disabled={pending}>
            <Icon name="plus" width="16" height="16" />
            {pending ? 'Creating…' : 'Create ' + kind}
          </button>
        </div>
      </form>
    </dialog>
  )
}
