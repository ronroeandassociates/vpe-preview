# VPE Agenda Schedule Engine

A Toastmasters Vice President of Education tool for generating repeatable meeting schedules with:

- Meeting cadence and date generation
- Agenda format pattern rotation (3-1-1, hybrid, growth cycle, and more)
- Officer-aware presiding officer logic
- Member role rotation with duplicate prevention
- New member onboarding — step-order role assignment through 7 stages
- Rolling window planning (3–5 weeks) with locked and adjustment windows
- 72-month theme and vocabulary master library (Formation + Mastery cycles)
- Phase 4 standalone word bank — 200 terms, tag-based selection, per-schedule repeat tracking
- CSV import from TI membership reports and FreeToastHost exports

## Tech stack

React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · Lucide React

## Development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Production build

```bash
npm run build      # output → dist/
```

## Deployment

Trigger the **Build & Deploy to EC2** workflow manually from GitHub Actions.

Required repository secrets: `EC2_HOST`, `EC2_USERNAME`, `EC2_KEY`, `EC2_DEPLOY_PATH`

See `nginx.conf` for the nginx server block configuration.
