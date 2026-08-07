import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Panel } from '../components/Panel'
import { ProjectRow } from '../components/ProjectRow'

const ATTENTION_ITEMS = [
  { label: 'Coding', duration: '3h 10m', tone: 'dark' },
  { label: 'Design', duration: '1h 05m', tone: 'mid' },
  { label: 'Reading', duration: '45m', tone: 'light' },
  { label: 'Offline', duration: '2h 10m', tone: 'pale' },
] as const

export function HomeView() {
  return (
    <>
      <Panel className="focus-panel">
        <h2>Current focus</h2>

        <div className="focus-panel__body">
          <div className="focus-mark" aria-hidden="true">N</div>
          <div className="focus-copy">
            <span>Nerve</span>
            <strong>Build the system architecture</strong>
            <div className="focus-meta">
              <span><Icon name="focus" />Deep work</span>
              <i aria-hidden="true">·</i>
              <span>Architecture</span>
            </div>
          </div>

          <div className="focus-timer">
            <time dateTime="PT1H26M14S">01:26:14</time>
            <div className="focus-actions">
              <Button><Icon name="pause" />Pause</Button>
              <Button variant="solid"><Icon name="finish" />Finish</Button>
            </div>
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
          <ProjectRow name="Nerve" description="LifeOS for humans" tasks={3} progress={72} barProgress={84.2} mark="N" />
          <ProjectRow name="Inboxless" description="Zero inbox lifestyle" tasks={2} progress={58} barProgress={64.1} icon="inbox" />
          <ProjectRow name="Time" description="Watch it. Own it." tasks={1} progress={34} barProgress={41.1} icon="clock" />
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
