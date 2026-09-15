# DextorOS portal

The product console behind the landing page in `../DEXTOROS`. See `PLAN.md` for the phased plan and the
screen list; the landing page's `docs/` folder is the product spec.

## Run it

```bash
npm install
npm run dev        # http://localhost:3001
npm run build
npm run lint
npm run typecheck
```

## Layout

| Path | What it holds |
| --- | --- |
| `src/app/(app)/` | Every signed-in screen, wrapped by the app shell. |
| `src/components/connect/` | Connect-a-robot wizard, connector file and install command, pairing status, keys panel. |
| `src/components/skills/` | Capability matrix, hold to teach, skill list and detail. |
| `src/components/training/` | Training sessions: episodes, training, evaluation, publish. |
| `src/components/console/` | Command input with history, log list, and the per-robot and fleet-wide consoles. |
| `src/components/shell/` | Sidebar, top bar, page header, settings tabs, placeholders. |
| `src/components/theme/`, `src/lib/theme.ts` | The theme switch and startup script, copied from the landing page. |
| `src/lib/domain/` | Types, platforms and body kinds. |
| `src/lib/engine/sim.ts` | The simulated fleet: telemetry ticks, command parsing, replies, pairing and the demo seed. Pure functions. |
| `src/lib/engine/skills.ts` | Skills, versions, learning on connect and training session ticks. Pure functions. |
| `src/lib/engine/connector.ts` | Connector YAML per transport, install command, pairing keys. |
| `src/lib/routes.ts` | Encoded robot links and param decoding. Robot IDs are free text. |
| `src/lib/api/` | `FleetSource`, the one interface screens talk to, and the simulated implementation. Swap it here for the live backend. |
| `src/lib/store/fleet.ts` | `useFleet`, `useRobot`, `useRobotLogs`, `useLiveCount` and `fleetActions`. |
| `src/lib/fleet.ts` | Capabilities, demo robot specs and skills. |
| `src/lib/site.ts` | URLs, connector host and navigation. |

Design tokens live in `src/app/globals.css` and mirror the landing page. Keep the two in sync by hand until
the shared pieces move into a package.
