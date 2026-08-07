import { useEffect } from 'react'
import { AppShell } from './components/AppShell'
import { RightRail } from './components/RightRail'
import { HomeView } from './views/HomeView'

export default function App() {
  useEffect(() => {
    document.title = 'Home — Nerve'
  }, [])

  return (
    <AppShell rightRail={<RightRail />}>
      <HomeView />
    </AppShell>
  )
}
