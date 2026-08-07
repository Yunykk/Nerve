import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  readonly children: ReactNode
  readonly rightRail: ReactNode
}

export function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      
      <Sidebar />

      <div className="workspace">
        <Topbar />
        <div className="home-columns">
          <main id="main-content" className="home-main" tabIndex={-1}>
            {children}
          </main>
          {rightRail}
        </div>
      </div>
    </div>
  )
}
