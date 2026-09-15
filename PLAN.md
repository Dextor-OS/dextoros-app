# DextorOS portal: development plan

The portal is the product behind the landing page in `../DEXTOROS`. The landing page's `docs/` folder is the
product spec: every screen below is drawn from those pages. The portal shares the landing page's design
tokens, fonts, theme switch and button/field styles so both feel like one product.

Target URL: `app.dextoros.app`. The landing page's `primaryCta.href` in `src/lib/site.ts` points here at launch.

## Decisions

| Area | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript, Tailwind 4 | Same as the landing page, so tokens, fonts and components port over unchanged. |
| Location | `dextoros-app/`, a sibling of `DEXTOROS/` | Separate deploy and separate Vercel project. Shared code is copied, not linked, until a monorepo is worth it. |
| Animation | Motion only. No GSAP, no three.js. | The portal is a tool. Motion covers list reorders, drawers and state changes; the landing page's scroll and 3D work has no place here. |
| State | Zustand store per domain (fleet, skills, rules, session) | Small, typed, works with a simulated engine now and a WebSocket feed later. |
| Data, phase 1 | Client-side fleet engine (ported from the landing page's console simulation), persisted to localStorage | No backend exists yet. The demo fleet in the docs is exactly this simulation, so it ships real value. |
| Data, phase 2 | Supabase (Postgres, Auth, Realtime) plus a robot gateway at `fleet.dextoros.app` | Auth, teams and rows in one service; the gateway is the WebSocket, MQTT, ROS 2 and serial endpoint the connector YAML already names. |
| API contract | `src/lib/api/*` exposes typed functions and a `FleetSource` interface; the simulation and the real backend both implement it | Screens never know which one they talk to, so swapping the backend touches no UI. |
| Charts | Hand-drawn SVG sparklines for latency and battery | One line chart type, no chart library. |
| Icons | Phosphor | Same as the landing page. |
| Phone app | PWA: manifest, installable, standalone display | The docs promise "an app you can install on your phone". A PWA of the same portal delivers it without a second codebase. |

## Screens and routes

Public (no session):

| Route | Screen |
| --- | --- |
| `/login`, `/signup` | Email and password, magic link later. |
| `/invite/[token]` | Accept a team invitation. |

App shell (`/(app)`): left sidebar with Fleet, Console, Skills, Training, Rules, Activity, Settings; top bar with the robot search, live count and theme switch.

| Route | Screen | Source doc |
| --- | --- | --- |
| `/` | Redirect to `/fleet`, or `/onboarding` on first visit. | quickstart |
| `/onboarding` | Choose: start with the demo fleet, or connect a robot. | quickstart |
| `/fleet` | Fleet list with all, online and offline filters. Robot ID, platform, activity, battery, latency. | fleet-dashboard |
| `/fleet/[robotId]` | Robot page: live telemetry that fits its body (arm vs mobile vs legged), 48-sample latency chart, joint angles, embedded console, full history. | fleet-dashboard, console-commands |
| `/fleet/[robotId]/connector` | Connector file, install command, pairing state, rotate and revoke key. | keys-and-pairing, transports |
| `/robots/new` | Connect a robot wizard: name, platform, transport, download YAML, install, wait for first connection. | connect-your-first-robot |
| `/console` | Fleet-wide console: pick a robot, send commands, 20-entry history with arrow keys, quick commands per body. | console-commands |
| `/skills` | Skill list and capability matrix: pick a skill, see who can run it and what each robot is missing. | which-robots-can-run-a-skill, capabilities |
| `/skills/[skillId]` | Versions, teacher, learned-by count, Hold to teach. | versions, teach-a-skill |
| `/training` | Sessions: collecting episodes, training, evaluating, published. Pause and resume while collecting. | teach-a-skill |
| `/rules` | Rule list and builder: one trigger, one action, threshold, preview "1 of 4 robots would dock". | rules |
| `/activity` | Searchable log across the fleet, filter by robot and type (cmd, ack, event, error). | fleet-dashboard |
| `/settings/team` | Members, roles (owner, operator, viewer), invites. | team-and-access |
| `/settings/fleet` | Remove the demo fleet in one click. | team-and-access |
| `/settings/profile` | Name, email, theme. | |

## Phases

Each phase ends with `npm run lint` and `npx tsc --noEmit` clean and the app running at `http://localhost:3001`.

### Phase 1. Foundation (done)
1. Scaffold Next.js 16 with the same tsconfig, ESLint and PostCSS as the landing page.
2. Port tokens, fonts, theme script, theme switch, logo, `.btn`, `.field`, `.panel`, `.live-dot`.
3. Build the app shell: sidebar, top bar, responsive drawer on phones, route placeholders.
4. Port `fleet.ts` (capabilities, robots, skills) as the seed of the domain model.

### Phase 2. Domain and engine (done, except rule evaluation which moves to phase 7)
1. Types: `Robot`, `Telemetry`, `LogLine`, `Skill`, `SkillVersion`, `TrainingSession`, `Rule`, `Member`.
2. `FleetSource` interface: subscribe to units, send command, generate connector, rotate key, teach, start session, save rule.
3. `SimulatedFleetSource`: port the tick loop, command parser and replies from the landing page's `live-console.tsx`, extended with the two robots the docs add (MM-01, DLT-07) and rule evaluation.
4. Zustand stores wired to the source. localStorage persistence for the parts that should survive a reload (rules, skills, removed demo fleet, command history).

### Phase 3. Fleet (done)
1. `/fleet` list with filters and activity labels.
2. `/fleet/[robotId]` telemetry panels per body, latency sparkline, joints, history.
3. Offline state: No data, No signal, last seen.

### Phase 4. Console (done)
1. Command input with history (up and down, last 20), case-insensitive parsing, quick commands.
2. Replies and errors exactly as the docs list them, including the offline rule (only `help` and `status`).
3. Same component embedded on the robot page.

### Phase 5. Connect a robot (done)
1. Wizard: name to slug, platform, transport, YAML preview, download, install command copy.
2. Pairing states: Waiting for first connection, Handshake, Live (Test mode simulates the sequence).
3. Rotate and revoke keys with the reinstall warnings from the docs.

### Phase 6. Skills and training (done)
1. Capability matrix reused from the landing page's `fleet-matrix`, made into a real list with per-skill pages.
2. Hold to teach creates a new version and propagates it to capable robots.
3. Training sessions: episodes flow in, train, evaluate against held-out episodes, publish back.

### Phase 7. Rules and activity
1. Rule builder with the two triggers and two actions, threshold slider 5 to 60 percent, preview count.
2. The engine fires rules and writes events into the log.
3. `/activity` search and filters.

### Phase 8. Team, settings, onboarding
1. Onboarding choice, demo fleet removal, profile.
2. Team members and roles kept in the store until auth lands.

### Phase 9. Auth and backend
1. Supabase project: `organizations`, `members`, `robots`, `robot_keys`, `skills`, `skill_versions`, `sessions`, `rules`, `events`.
2. Supabase Auth with email, magic link and invites. Row-level security per organization.
3. `LiveFleetSource`: Supabase Realtime for rows, a WebSocket to the gateway for telemetry and commands.
4. Gateway contract document for the connector team: handshake, capabilities, telemetry, events, commands.

### Phase 10. Ship
1. PWA manifest and icons, standalone display, offline shell.
2. Accessibility pass: keyboard on every control, reduced motion, focus order, contrast in both themes.
3. Playwright smoke tests for each route and the console command set.
4. Vercel project `dextoros-app`, `app.dextoros.app`, then point the landing page CTA here.

## Design rules carried over

Dark is the default and light is lab daylight. Every color comes from a token. Brand blue is a solid fill on
primary buttons only. Volt marks live and active states only. Mona Sans for text, Martian Mono for robot IDs,
commands and numbers. Panels 14px, controls 10px, tags 6px, cells 3px. Sentence case, no em dashes, one label
per intent. Every animation explains a state change and has a reduced-motion fallback.
