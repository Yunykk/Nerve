import avatarHaru from '../assets/avatar-haru.png'
import { Icon } from './Icon'
import { Panel } from './Panel'

export function RightRail() {
  return (
    <Panel as="aside" className="right-rail" aria-label="Now">
      <h2>Now</h2>

      <section className="rail-section rail-section--next">
        <div className="rail-heading">
          <Icon name="list" />
          <h3>Next</h3>
        </div>
        <button className="rail-next" type="button">
          <span>
            <strong>Define API contracts</strong>
            <small>Nerve</small>
          </span>
          <Icon name="chevron" />
        </button>
      </section>

      <section className="rail-section rail-section--context">
        <div className="rail-heading">
          <Icon name="tag" />
          <h3>Context</h3>
        </div>
        <div className="context-chips">
          <span>Deep work</span>
          <span>Architecture</span>
          <span>Mac</span>
          <span>Morning</span>
        </div>
      </section>

      <section className="rail-section rail-section--devices">
        <div className="rail-heading">
          <Icon name="phone" />
          <h3>Connected devices</h3>
        </div>
        <DeviceRow icon="laptop" name="MacBook Pro" detail="macOS 14.6" />
        <DeviceRow icon="phone" name="iPhone 15 Pro" detail="iOS 17.6" />
      </section>

      <section className="rail-section rail-section--people">
        <div className="rail-heading">
          <Icon name="user" />
          <h3>People</h3>
        </div>

        <button className="person-card" type="button">
          <img src={avatarHaru} alt="" />
          <span className="person-card__copy">
            <strong>Check in with Haru</strong>
            <small>She asked for a demo<br />this week.</small>
          </span>
          <span className="person-card__when">Today</span>
        </button>

        <button className="relationship-link" type="button">
          <Icon name="users" />
          <span>View all relationships</span>
          <Icon name="chevron" />
        </button>
      </section>
    </Panel>
  )
}

interface DeviceRowProps {
  readonly icon: 'laptop' | 'phone'
  readonly name: string
  readonly detail: string
}

function DeviceRow({ icon, name, detail }: DeviceRowProps) {
  return (
    <button className="device-row" type="button">
      <Icon className="device-row__icon" name={icon} />
      <span className="device-row__copy">
        <strong>{name}</strong>
        <small>{detail}</small>
      </span>
      <span className="device-row__status">
        <i aria-hidden="true" /> Active
      </span>
      <Icon className="device-row__chevron" name="chevron" />
    </button>
  )
}
