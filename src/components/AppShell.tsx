import type { ReactNode } from 'react'
import type { AppRoute } from '../App'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  readonly children: ReactNode
  readonly route: AppRoute
  readonly rightRail?: ReactNode
  readonly title?: string | undefined
  readonly subtitle?: string | undefined
}

export function AppShell({ 
  children, 
  route,
  rightRail,
  title,
  subtitle, 
}: AppShellProps) {

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      
      <Sidebar route={route} />

      <div className="workspace">
        <Topbar title={title} subtitle={subtitle} />
        <div className={'home-columns' + (rightRail ? '' : ' home-columns--wide')}>
          <main id="main-content" className="home-main" tabIndex={-1}>
            {children}
          </main>
          {rightRail}
        </div>
      </div>
    </div>
  )
}
