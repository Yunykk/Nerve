import {
  selectActiveSession,
  selectEntities,
  selectEntity,
  selectSessionDuration,
  selectSessionSlicesForDay,
  selectTrackedTimeForDay,
} from '../domain/selectors'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { ProjectRow } from '../components/ProjectRow'
import { useClock } from '../hooks/useClock'
import { formatDuration } from '../lib/format'
import { useNerve } from '../state/useNerve'

const ATTENTION_ITEMS = [
  { label: 'Coding', duration: '3h 10m', tone: 'dark' },
  { label: 'Design', duration: '1h 05m', tone: 'mid' },
  { label: 'Reading', duration: '45m', tone: 'light' },
  { label: 'Offline', duration: '2h 10m', tone: 'pale' },
] as const

const DAILY_FOCUS_TARGET_MS = 4 * 60 * 60 * 1_000

export function HomeView() {
  const { state, actions, pending } = useNerve()

  const activeSession = selectActiveSession(state)
  const projects = selectEntities(state, 'project').filter(
    (project) => project.status === 'active',
  )

  const activeProject = activeSession
    ? selectEntity(state, activeSession.projectId)
    : undefined

  const now = useClock(activeSession ? 1000 : 60_000)

  const elapsed = activeSession
    ? selectSessionDuration(activeSession, now)
    : 0

  return (
    <>
      <Panel className="focus-panel">
        <h2>Current focus</h2>

        <div className="focus-panel__body">
          <div className="focus-mark" aria-hidden="true">
            {activeProject?.name.charAt(0).toUpperCase() ?? '—'}
          </div>

          <div className="focus-copy">
            <span>{activeSession ? 'Active focus' : 'System idle'}</span>

            <strong>
              {activeProject?.name ?? 'No active session'}
            </strong>

            <div className="focus-meta">
              <span>
                <Icon name="focus" />
                {activeSession ? 'Deep work' : 'Ready'}
              </span>

              <i aria-hidden="true">·</i>

              <span>
                {activeProject?.description || 'Choose a project to begin'}
              </span>
            </div>
          </div>

          <div className="focus-timer">
            <time dateTime={'PT' + Math.floor(elapsed / 1_000) + 'S'}>
              {formatDuration(elapsed)}
            </time>

            {activeSession && (
              <div className="focus-actions">
                <Button
                  variant="solid"
                  disabled={pending}
                  onClick={() => void actions.stopSession()}
                >
                  <Icon name="finish" />
                  {pending ? 'Ending…' : 'End session'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Panel>

      <section className="attention" aria-labelledby="attention-title">
        <h2 id="attention-title">Today’s attention</h2>
        <div className="attention__times" aria-hidden="true">
          <span>09:00</span>
          <span>12:00</span>
          <span>15:00</span>
          <span>18:00</span>
        </div>
        <div className="attention__bar" aria-hidden="true">
          <span className="attention__segment attention__segment--coding" />
          <span className="attention__segment attention__segment--design" />
          <span className="attention__segment attention__segment--reading" />
          <span className="attention__segment attention__segment--offline" />
          <i className="attention__marker" />
        </div>
        <div className="attention__legend">
          {ATTENTION_ITEMS.map((item) => (
            <div key={item.label}>
              <i className={'attention-dot attention-dot--' + item.tone} aria-hidden="true" />
              <span>
                <strong>{item.label}</strong>
                <small>{item.duration}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="projects-section" aria-labelledby="projects-title">
        <h2 id="projects-title">Active projects</h2>
        <Panel className="project-list">
          {projects.length ? (
            projects.slice(0, 3).map((project) => {
              const isActive = activeSession?.projectId === project.id
              const unavailable = Boolean(activeSession && !isActive)
              const sessionsToday = selectSessionSlicesForDay(
                state,
                now,
                project.id,
              ).length
              const trackedToday = selectTrackedTimeForDay(
                state,
                now,
                project.id,
              )

              return (
                <ProjectRow
                  key={project.id}
                  name={project.name}
                  description={project.description || 'No description'}
                  sessions={sessionsToday}
                  progress={0}
                  barProgress={Math.min(
                    (trackedToday / DAILY_FOCUS_TARGET_MS) * 100,
                    100,
                  )}
                  mark={project.name.charAt(0).toUpperCase()}
                  actionLabel={
                    isActive
                      ? pending
                        ? 'Ending…'
                        : 'End'
                      : unavailable
                        ? 'Busy'
                        : pending
                          ? 'Wait…'
                          : 'Start'
                  }
                  active={isActive}
                  disabled={pending || unavailable}
                  onClick={() =>
                    void (
                      isActive
                        ? actions.stopSession()
                        : actions.startSession(project.id)
                    )
                  }
                />
              )
            })
          ) : (
            <p className="project-list__empty">No active projects yet.</p>
          )}
        </Panel>
      </section>

      <Panel className="screen-time-panel">
        <div className="screen-time-summary">
          <h2>Screen time</h2>
          <strong>3h 42m</strong>
          <span>↓ 18m from yesterday</span>
        </div>

        <ScreenTimeChart />

        <div className="screen-time-apps">
          <AppUsage icon="cursor" name="Cursor" duration="1h 28m" />
          <AppUsage icon="vscode" name="VS Code" duration="1h 02m" />
          <AppUsage icon="safari" name="Safari" duration="37m" />
          <button className="view-all" type="button">
            <span>View all</span>
            <Icon name="chevron" />
          </button>
        </div>
      </Panel>
    </>
  )
}

function ScreenTimeChart() {
  return (
    <div className="screen-time-chart" aria-label="Screen time over the last seven days">
      <svg viewBox="0 0 470 140" role="img" aria-hidden="true">
        <g className="chart-grid">
          <line x1="27" y1="24" x2="436" y2="24" />
          <line x1="27" y1="66" x2="436" y2="66" />
          <line x1="27" y1="109" x2="436" y2="109" />
        </g>
        <g className="chart-labels">
          <text x="0" y="28">6h</text>
          <text x="0" y="70">3h</text>
          <text x="0" y="113">0</text>
          <text x="59" y="130" textAnchor="middle">Thu</text>
          <text x="120" y="130" textAnchor="middle">Fri</text>
          <text x="181" y="130" textAnchor="middle">Sat</text>
          <text x="241" y="130" textAnchor="middle">Sun</text>
          <text x="301" y="130" textAnchor="middle">Mon</text>
          <text x="362" y="130" textAnchor="middle">Tue</text>
          <text className="chart-label-current" x="422" y="130" textAnchor="middle">Wed</text>
        </g>
        <path className="chart-line" d="M59 80 L120 63 L181 70 L241 89 L301 70 L362 75 L422 65" />
        <g className="chart-points">
          <circle cx="59" cy="80" r="4.5" />
          <circle cx="120" cy="63" r="4.5" />
          <circle cx="181" cy="70" r="4.5" />
          <circle cx="241" cy="89" r="4.5" />
          <circle cx="301" cy="70" r="4.5" />
          <circle cx="362" cy="75" r="4.5" />
          <circle cx="422" cy="65" r="5" />
          <circle className="chart-current-ring" cx="422" cy="65" r="9" />
        </g>
      </svg>
    </div>
  )
}

interface AppUsageProps {
  readonly icon: 'cursor' | 'vscode' | 'safari'
  readonly name: string
  readonly duration: string
}

function AppUsage({ icon, name, duration }: AppUsageProps) {
  return (
    <div className="app-usage">
      <span className="app-usage__icon"><Icon name={icon} /></span>
      <strong>{name}</strong>
      <span>{duration}</span>
    </div>
  )
}
