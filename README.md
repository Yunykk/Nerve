# Nerve

> A personal operating system that connects your time, projects, goals, and devices into one living system.

Nerve is an open-source experiment in treating personal activity as one connected
system instead of another collection of productivity widgets. Its foundation is a
small unified model:

- **Entities** are the things in your world: projects, goals, areas, people, and
  devices.
- **Events** are immutable facts: an entity was created, a relation was made, or a
  focus session started or stopped.
- **Relations** explain how the world fits together, beginning with a project that
  supports a goal.

Phase 1 is a functional, local-first vertical slice. Create a goal and a project,
connect them, track a focus session, inspect the event history on TIMELINE, and see
the resulting system on WORLD. There is no account, cloud dependency, analytics
service, or server required.

## Local setup

Requirements:

- Node.js 22.12 or newer
- npm 10 or newer

Install and start the development server:

    npm install
    npm run dev

Vite will print the local URL, normally http://localhost:5173.

Data is stored in the browser under the localStorage key
nerve:event-stream:v1. It stays on the current browser and origin.

## Commands

    npm run dev          Start the Vite development server
    npm run typecheck    Run the TypeScript project checks
    npm run lint         Run ESLint
    npm test             Run core domain and storage tests once
    npm run test:watch   Run tests in watch mode
    npm run build        Typecheck and create a production build
    npm run preview      Preview the production build

## Phase 1 behavior

1. Create a goal from the GOALS region on NOW.
2. Create a project from ACTIVE PROJECTS.
3. Use the unlinked project action to create a supports relation.
4. Start and stop focus from the project row.
5. Inspect the same underlying event stream on TIMELINE and its projection on WORLD.

Only one focus session can run at once. Today’s tracked time clips session intervals
to the current local day and includes the live interval while a session is running.

## Project structure

    src/
      components/        Shell, icons, and focused dialogs
      domain/            Types, commands, projector, selectors, and store
      hooks/             Small React utilities
      lib/               Display formatting
      state/             React boundary around the domain store
      storage/           Storage interface plus local and memory adapters
      views/             NOW, TIMELINE, and WORLD
    docs/
      architecture.md    Unified-model design and extension points
    DEVLOG.md            Phase 1 implementation record

The UI never accesses localStorage directly. It talks to NerveStore, which depends
on the EventStorage interface. A future Supabase adapter can therefore replace
local persistence without changing page components.

## Intentionally not in Phase 1

Authentication, Supabase, native apps, Screen Time ingestion, calendar ingestion,
AI features, team workflows, and settings pages are intentionally absent. The
interface contains no empty navigation or placeholder feature pages.

## Logical Phase 2

Phase 2 should harden and extend the model before broadening the dashboard:

1. Add event schema migrations and entity lifecycle events such as rename,
   complete, archive, and relation removal.
2. Add a small activity capture API and calendar import as the first external
   event source, with deduplication and provenance.
3. Add areas and people to WORLD only when they have real create/connect workflows.
4. Introduce an optional remote EventStorage implementation, offline reconciliation,
   and multi-device sync.
5. Add export/import and recovery tools before authentication or native clients.

See [docs/architecture.md](docs/architecture.md) for the design in detail.
