import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { RightRail } from './components/RightRail'
import { HomeView } from './views/HomeView'
import { ProjectsView } from './views/ProjectsView'

type AppRoute = 'home' | 'projects'

function getRouteFromHash(): AppRoute {
  return window.location.hash === '#projects' ? 'projects' : 'home'
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getRouteFromHash)

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    document.title =
      route === 'projects' ? 'Projects — Nerve' : 'Home — Nerve'
  }, [route])

  const isProjects = route === 'projects'

  return (
    <AppShell
      rightRail={<RightRail />}
      title={isProjects ? 'Projects' : undefined}
      subtitle={
        isProjects ? 'Everything you’re moving forward' : undefined
      }
    >
      {isProjects ? <ProjectsView /> : <HomeView />}
    </AppShell>
  )
}