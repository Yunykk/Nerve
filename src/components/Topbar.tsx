import { Icon } from './Icon'

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__greeting">
        <h1>Good morning, Yuunyk</h1>
        <p>Wednesday, August 5</p>
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
