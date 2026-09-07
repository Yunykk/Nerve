import type { Entity } from '../domain/types'
import { selectEntities } from '../domain/selectors'
import { truncateLabel } from '../lib/format'
import { useNerve } from '../state/useNerve'
import { Icon } from '../components/Icon'

interface NodePosition {
  readonly entity: Entity
  readonly x: number
  readonly y: number
}

function layoutColumn(
  entities: readonly Entity[],
  x: number,
  height: number,
): readonly NodePosition[] {
  const top = 86
  const available = height - top * 2
  const gap = entities.length > 1 ? available / (entities.length - 1) : 0

  return entities.map((entity, index) => ({
    entity,
    x,
    y: entities.length === 1 ? height / 2 : top + gap * index,
  }))
}

export function WorldView() {
  const { state } = useNerve()
  const goals = selectEntities(state, 'goal')
  const projects = selectEntities(state, 'project')
  const maxNodes = Math.max(goals.length, projects.length, 1)
  const graphHeight = Math.max(500, maxNodes * 128)
  const goalNodes = layoutColumn(goals, 235, graphHeight)
  const projectNodes = layoutColumn(projects, 725, graphHeight)
  const nodesById = new Map(
    [...goalNodes, ...projectNodes].map((node) => [node.entity.id, node]),
  )
  const hasEntities = goals.length + projects.length > 0

  return (
    <section className="panel world-panel" aria-labelledby="world-heading">
      <div className="panel-heading world-heading">
        <div>
          <p className="eyebrow">RELATION MAP</p>
          <h2 id="world-heading">The living system</h2>
        </div>
        <div className="graph-legend" aria-label="Graph legend">
          <span><i className="legend-node legend-node--project" /> Project</span>
          <span><i className="legend-node" /> Goal</span>
        </div>
      </div>

      {hasEntities ? (
        <>
          <div className="graph-stage">
            <svg
              className="world-graph"
              viewBox={'0 0 960 ' + String(graphHeight)}
              role="img"
              aria-labelledby="world-graph-title world-graph-description"
              preserveAspectRatio="xMidYMid meet"
            >
              <title id="world-graph-title">Nerve entity and relation graph</title>
              <desc id="world-graph-description">
                Goals are outlined nodes on the left. Projects are black nodes on the
                right. Lines show which projects support which goals.
              </desc>

              <g className="graph-guides" aria-hidden="true">
                <line x1="235" x2="235" y1="44" y2={graphHeight - 44} />
                <line x1="725" x2="725" y1="44" y2={graphHeight - 44} />
                <line x1="90" x2="870" y1={graphHeight / 2} y2={graphHeight / 2} />
              </g>

              <g className="graph-column-labels" aria-hidden="true">
                <text x="235" y="30">GOALS</text>
                <text x="725" y="30">PROJECTS</text>
              </g>

              <g className="relation-edges">
                {state.relations.map((relation) => {
                  const source = nodesById.get(relation.sourceEntityId)
                  const target = nodesById.get(relation.targetEntityId)

                  if (!source || !target) {
                    return null
                  }

                  const midX = (source.x + target.x) / 2
                  const midY = (source.y + target.y) / 2

                  return (
                    <g key={relation.id}>
                      <line
                        x1={source.x - 57}
                        y1={source.y}
                        x2={target.x + 57}
                        y2={target.y}
                        vectorEffect="non-scaling-stroke"
                      />
                      <rect
                        className="relation-label-bg"
                        x={midX - 39}
                        y={midY - 10}
                        width="78"
                        height="20"
                        rx="4"
                      />
                      <text className="relation-label" x={midX} y={midY + 3}>
                        SUPPORTS
                      </text>
                    </g>
                  )
                })}
              </g>

              <g className="goal-nodes">
                {goalNodes.map(({ entity, x, y }) => (
                  <g
                    className="graph-node graph-node--goal"
                    key={entity.id}
                    transform={'translate(' + String(x) + ' ' + String(y) + ')'}
                  >
                    <title>{'Goal: ' + entity.name}</title>
                    <circle r="57" />
                    <text className="node-kind" y="-9">GOAL</text>
                    <text className="node-name" y="12">{truncateLabel(entity.name)}</text>
                  </g>
                ))}
              </g>

              <g className="project-nodes">
                {projectNodes.map(({ entity, x, y }) => (
                  <g
                    className="graph-node graph-node--project"
                    key={entity.id}
                    transform={'translate(' + String(x) + ' ' + String(y) + ')'}
                  >
                    <title>{'Project: ' + entity.name}</title>
                    <circle r="57" />
                    <text className="node-kind" y="-9">PROJECT</text>
                    <text className="node-name" y="12">{truncateLabel(entity.name)}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className="world-footer">
            <span>
              {goals.length + projects.length} ENTITIES · {state.relations.length} RELATIONS
            </span>
            <a href="#projects" className="inline-link">
              Manage projects <Icon name="arrow" width="15" height="15" />
            </a>
          </div>

          <div className="relation-index">
            <p className="eyebrow">RELATION INDEX</p>
            {state.relations.length ? (
              <ul>
                {state.relations.map((relation) => {
                  const project = nodesById.get(relation.sourceEntityId)?.entity
                  const goal = nodesById.get(relation.targetEntityId)?.entity

                  return (
                    <li key={relation.id}>
                      <strong>{project?.name ?? 'Unknown project'}</strong>
                      <span>supports</span>
                      <strong>{goal?.name ?? 'Unknown goal'}</strong>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="relation-empty">
                Entities exist, but no relation has been created yet. Link a project
                to a goal on Projects.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="world-empty">
          <div className="empty-orbit" aria-hidden="true">
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">0 ENTITIES · 0 RELATIONS</p>
            <h3>Your world has no nodes yet.</h3>
            <p>Create a goal and a project on Projects. Their relation will appear here.</p>
            <a className="button button--solid" href="#projects">
              Build first thread <Icon name="arrow" width="16" height="16" />
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
