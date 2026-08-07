# Nerve architecture

## Core idea

Nerve treats the event stream as the durable record of the system. Entities,
relations, focus sessions, NOW totals, and the WORLD graph are projections rebuilt
from that stream.

The application flow is:

    React UI
      → NerveStore command
      → domain validation
      → append one immutable event through EventStorage
      → replay events into DomainState
      → notify React

This avoids a common failure mode where a current-state table says one thing while
an activity log says another. A successful Phase 1 command creates exactly one
event. A rejected command creates none.

## Entities

Entity is the common typed object for:

- goal
- project
- area
- person
- device

Phase 1 exposes creation only for goals and projects. The remaining kinds are in the
domain vocabulary so new event sources can use the same model later; they do not
produce empty pages today.

Each entity has an identifier, kind, name, description, lifecycle status, and ISO
timestamps. Historical events embed the created entity so replay does not depend on
another database read.

## Relations

Relation has its own identifier, kind, endpoints, and creation timestamp. Phase 1
supports one directed relation:

    project ── supports ──> goal

Both endpoints must already exist, direction and kinds must be correct, and the
same project/goal pair cannot be connected twice. WORLD reads the projected
entities and relations; it does not maintain separate graph data.

## Events

NerveEvent is a discriminated TypeScript union:

- entity.created contains the complete new entity.
- relation.created contains the complete new relation.
- session.started identifies the session and project.
- session.stopped identifies the same session and project.
- work.completed is part of the event contract for the next work-completion flow,
  but has no unused Phase 1 UI.

Event payloads are historical contracts. Future changes should add events such as
entity.renamed or relation.removed rather than rewriting prior events. Breaking
payload changes require a persisted schema migration.

## Projection and selectors

projectEvents performs a deterministic replay into DomainState:

- entity.created adds an entity.
- relation.created adds an edge.
- session.started opens a FocusSession projection.
- session.stopped closes that session.
- every event remains available to TIMELINE.

Selectors derive the active session, connected goals, session slices, and tracked
duration. The daily selector intersects each session interval with the boundaries
of the current local day. This handles sessions crossing midnight and local
daylight-saving boundaries. An active interval ends at the explicitly supplied
current time, keeping selectors deterministic and testable.

## Command invariants

Commands enforce these Phase 1 rules:

- Names are trimmed and cannot be empty.
- Entity, relation, event, and session identifiers are unique.
- A supports relation runs from an existing project to an existing goal.
- Duplicate supports relations are rejected.
- Sessions can start only for active projects.
- At most one focus session is active globally.
- A stop event must close the active session and cannot precede its start.
- Persistence succeeds before the in-memory projection is published.

The projector repeats structural validation while replaying. A malformed or
impossible event stream fails explicitly instead of presenting misleading state.

## Storage boundary

EventStorage has two asynchronous operations:

    load(): Promise<readonly NerveEvent[]>
    append(events): Promise<readonly NerveEvent[]>

LocalEventStorage stores a versioned document:

    {
      schemaVersion: 1,
      events: [...]
    }

MemoryEventStorage supports deterministic tests. Neither React views nor selectors
know which adapter is active.

Before replacing the local document, LocalEventStorage replays the combined current
and incoming stream. This rejects stale-tab commands that would create an impossible
history, such as a second active session. It is an integrity guard, not a substitute
for transactional multi-tab or remote concurrency control.

A Supabase implementation can use the same boundary later: load an ordered stream,
append inside a transaction, and return the authoritative ordered result. Remote
sync will also need stable user/device stream identifiers, server ordering,
idempotency keys, and conflict policy. Those concerns deliberately do not leak into
Phase 1 UI code.

## Runtime boundaries

- React owns presentation, routing by URL hash, dialogs, and accessible feedback.
- NerveStore serializes commands and owns persistence coordination.
- Domain commands and selectors are framework-independent.
- CSS and inline SVG provide the entire visual system; no component or graph
  library is loaded.

## Persistence limitations in Phase 1

localStorage is appropriate for a single-browser prototype but has known limits:

- Multi-tab writes are not transactional.
- Storage quota is finite.
- There is no automatic backup or cross-device sync.
- Data belongs to the browser origin.

The adapter reads the current document before each append and never silently clears
invalid data. Export/import, migrations, and remote reconciliation should arrive
before relying on Nerve as a long-term system of record.
