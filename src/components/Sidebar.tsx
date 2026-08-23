import avatarYuunyk from '../assets/avatar-yuunyk.png'
import { Icon, type IconName } from './Icon'

interface NavItem {
  readonly label: string
  readonly icon: IconName
  readonly href?: '#home' | '#timeline' | '#projects' | '#world' | '#surfaces'
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', icon: 'home', href: '#home' },
  { label: 'Timeline', icon: 'timeline' },
  { label: 'Projects', icon: 'projects', href: '#projects' },
  { label: 'World', icon: 'world' },
  { label: 'Surfaces', icon: 'surfaces' },
]

export function Sidebar() {
  const currentHref =
    window.location.hash === '#projects' ? '#projects' : '#home'
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar__brand">nerve</div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isCurrent = item.href === currentHref

          return (
            <a
              key={item.label}
              className={'sidebar__item' + (isCurrent ? ' is-current' : '')}
              href={item.href}
              aria-current={isCurrent ? 'page' : undefined}
              aria-disabled={item.href ? undefined : true}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          )
        })}
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
