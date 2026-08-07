import avatarYuunyk from '../assets/avatar-yuunyk.png'
import { Icon, type IconName } from './Icon'

interface NavItem {
  readonly label: string
  readonly icon: IconName
  readonly current?: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', icon: 'home', current: true },
  { label: 'Timeline', icon: 'timeline' },
  { label: 'Projects', icon: 'projects' },
  { label: 'World', icon: 'world' },
  { label: 'Surfaces', icon: 'surfaces' },
]

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar__brand">nerve</div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={'sidebar__item' + (item.current ? ' is-current' : '')}
            type="button"
            aria-current={item.current ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__utility" type="button">
          <Icon name="search" />
          <span>Search</span>
        </button>
        <button className="sidebar__utility" type="button">
          <Icon name="settings" />
          <span>Settings</span>
        </button>

        <div className="sidebar__rule" />

        <button className="sidebar__profile" type="button">
          <img src={avatarYuunyk} alt="" />
          <span>Yuunyk</span>
          <Icon name="chevron" />
        </button>
      </div>
    </aside>
  )
}
