import { useEffect, useState, type ReactNode } from 'react'
import { AppShell } from './components/AppShell'
import { RightRail } from './components/RightRail'
import { HomeView } from './views/HomeView'
import { ProjectsView } from './views/ProjectsView'
import { TimelineView } from './views/TimelineView'
import { WorldView } from './views/WorldView'
import { useNerve } from './state/useNerve'

export type AppRoute = 'home' | 'timeline' | 'projects' | 'world'

const ROUTES: Record<
  AppRoute,
  { readonly title: string; readonly subtitle: string; readonly view: ReactNode }
> = {
  home: {
    title: 'Home',
    subtitle: '',
    view: <HomeView />,
  },
  timeline: {
    title: 'Timeline',
    subtitle: 'Every change, in one local history',
    view: <TimelineView />,
  },
  projects: {
    title: 'Projects',
    subtitle: 'Everything you’re moving forward',
    view: <ProjectsView />,
  },
  world: {
    title: 'World',
    subtitle: 'Your goals and projects, connected',
    view: <WorldView />,
  },
}

function getRouteFromHash(): AppRoute {
  const candidate = window.location.hash.slice(1)
  return candidate === 'timeline' || candidate === 'projects' || candidate === 'world'
    ? candidate
    : 'home'
}

export default function App() {
  const { status, fatalError } = useNerve()
  const [route, setRoute] = useState<AppRoute>(getRouteFromHash)

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash())
    }

    function handleCommandSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        window.location.hash = 'projects'
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('keydown', handleCommandSearch)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('keydown', handleCommandSearch)
    }
  }, [])

  useEffect(() => {
    document.title = ROUTES[route].title + ' — Nerve'
  }, [route])

  const routeConfig = ROUTES[route]

  if (status !== 'ready') {
    return (
      <div className="app-state" role={status === 'error' ? 'alert' : 'status'}>
        <span className="app-state__brand">nerve</span>
        <h1>{status === 'error' ? 'Local data could not be opened' : 'Opening your system…'}</h1>
        {status === 'error' && <p>{fatalError}</p>}
      </div>
    )
  }

  return (
    <AppShell
      route={route}
      rightRail={route === 'home' ? <RightRail /> : undefined}
      title={route === 'home' ? undefined : routeConfig.title}
      subtitle={route === 'home' ? undefined : routeConfig.subtitle}
    >
      {routeConfig.view}
    </AppShell>
  )
}
