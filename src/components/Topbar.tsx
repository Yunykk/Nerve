import { useClock } from '../hooks/useClock'
import { Icon } from './Icon'

interface TopbarProps {
  readonly title?: string
  readonly subtitle?: string
}


export function Topbar({ title, subtitle }: TopbarProps) {
  const now = useClock(60_000)
  const hour = now.getHours()
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
      ? 'Good afternoon'
      : 'Good evening'
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now)

  
  return (
    <header className="topbar">
      <div className="topbar__greeting">
        <h1>{title ?? `${greeting}, Yuunyk`}</h1>
        <p>{subtitle ?? formattedDate}</p>
      </div>

      <button className="command-search" type="button">
        <Icon name="search" />
        <span>Search or run a command...</span>
        <span className="command-search__keys" aria-hidden="true">
          <kbd>⌘</kbd><kbd>K</kbd>
        </span>
      </button>
    </header>
  )
}
