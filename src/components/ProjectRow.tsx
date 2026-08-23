import { Icon, type IconName } from './Icon'

interface ProjectRowProps {
  readonly name: string
  readonly description: string
  readonly sessions: number
  readonly progress: number
  readonly barProgress?: number
  readonly mark?: string
  readonly icon?: IconName
  readonly actionLabel?: string
  readonly active?: boolean
  readonly disabled?: boolean
  readonly onClick?: () => void
}

export function ProjectRow({
  name,
  description,
  sessions,
  progress,
  barProgress = progress,
  mark,
  icon,
  actionLabel,
  active,
  disabled,
  onClick,
}: ProjectRowProps) {
  return (
    <button
      className={'project-row' + (active ? ' is-active' : '')}
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="project-row__mark" aria-hidden="true">
        {mark ?? (icon ? <Icon name={icon} /> : null)}
      </span>

      <span className="project-row__identity">
        <strong>{name}</strong>
        <span>{description}</span>
      </span>

      <span className="project-row__tasks">
        {sessions} {sessions === 1 ? 'session' : 'sessions'} today
      </span>

      <span className="project-row__progress" aria-hidden="true">
        <span style={{ width: barProgress + '%' }} />
      </span>
      <span className="project-row__percent">
        {actionLabel ?? progress + '%'}
      </span>
      <Icon className="project-row__chevron" name="chevron" />
    </button>
  )
}
