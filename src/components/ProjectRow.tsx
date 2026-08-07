import { Icon, type IconName } from './Icon'

interface ProjectRowProps {
  readonly name: string
  readonly description: string
  readonly tasks: number
  readonly progress: number
  readonly barProgress?: number
  readonly mark?: string
  readonly icon?: IconName
}

export function ProjectRow({
  name,
  description,
  tasks,
  progress,
  barProgress = progress,
  mark,
  icon,
}: ProjectRowProps) {
  return (
    <button className="project-row" type="button">
      <span className="project-row__mark" aria-hidden="true">
        {mark ?? (icon ? <Icon name={icon} /> : null)}
      </span>

      <span className="project-row__identity">
        <strong>{name}</strong>
        <span>{description}</span>
      </span>

      <span className="project-row__tasks">
        {tasks} {tasks === 1 ? 'task' : 'tasks'} today
      </span>

      <span className="project-row__progress" aria-hidden="true">
        <span style={{ width: barProgress + '%' }} />
      </span>
      <span className="project-row__percent">{progress}%</span>
      <Icon className="project-row__chevron" name="chevron" />
    </button>
  )
}
