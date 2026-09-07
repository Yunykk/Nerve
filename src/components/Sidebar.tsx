import avatarYuunyk from '../assets/avatar-yuunyk.png'
import type { AppRoute } from '../App'
import { Icon, type IconName } from './Icon'

interface NavItem {
  readonly label: string
  readonly icon: IconName
  readonly href: `#${AppRoute}`
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', icon: 'home', href: '#home' },
  { label: 'Timeline', icon: 'timeline', href: '#timeline' },
  { label: 'Projects', icon: 'projects', href: '#projects' },
  { label: 'World', icon: 'world', href: '#world' },
]

export function Sidebar({ route }: { readonly route: AppRoute }) {
  const currentHref = `#${route}`
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
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <a className="sidebar__utility" href="#projects">
          <Icon name="search" />
          <span>Find projects</span>
        </a>

        <div className="sidebar__rule" />

        <div className="sidebar__profile">
          <img src={avatarYuunyk} alt="" />
          <span>Yuunyk</span>
        </div>
      </div>
    </aside>
  )
}
