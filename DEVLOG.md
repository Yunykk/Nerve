# Development log

## Phase 1 — completed baseline slice

- Connected Home, Projects, Timeline, and World through working hash navigation.
- Added goal and project creation to the current interface and project-to-goal
  linking to project cards.
- Added project filtering plus Ctrl/⌘+K navigation to the project finder.
- Replaced demo attention, screen-time, device, and people content with live
  projections from the local event stream.
- Added loading and corrupt-storage error boundaries at the application root.
- Added a browser test for the complete create → link → focus → timeline → world
  workflow.

## Phase 1 — functional vertical slice

Built the first local-first Nerve system with React, TypeScript, Vite, plain CSS,
and no runtime dependencies beyond React.

### Product slice

- Added explicit goal and project creation.
- Added project-to-goal supports relations.
- Added globally exclusive focus session start/stop controls.
- Added a live current-focus timer and local-day tracked-time projection.
- Added NOW with current focus, attention track, active projects, goals, and a
  visible first-run sequence.
- Added a newest-first TIMELINE of the unified event stream.
- Added a responsive SVG WORLD graph and semantic relation index.
- Matched the supplied sterile OS reference with a pale monochrome shell, fine
  rules, compact technical labels, a mono timer, and restrained black controls.
- Kept navigation limited to functioning Phase 1 surfaces.

### Technical decisions

- The append-only event stream is authoritative; all current state is replayed.
- Domain commands, the projector, and selectors are pure or dependency-injected.
- NerveStore serializes commands and publishes state only after persistence.
- EventStorage isolates persistence; LocalEventStorage and MemoryEventStorage are
  the initial adapters.
- Persisted data is a schema-versioned document and corrupt data is reported
  without deletion.
- Candidate local writes are replay-validated before replacement so stale tabs
  cannot persist an impossible event history.
- Session totals use interval intersection with local-day boundaries.
- The app uses hash navigation and native dialogs to avoid router and UI-library
  weight.
- Core tests run in Node without a browser DOM package to stay light on low-memory
  machines.

### Deferred deliberately

Authentication, Supabase, Screen Time, calendar ingestion, native apps, AI,
settings, and unused feature pages remain outside Phase 1.
