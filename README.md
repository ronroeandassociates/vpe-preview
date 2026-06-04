# VPE Agenda Schedule Engine

A Toastmasters Vice President of Education tool that generates and manages a rolling 5-week meeting schedule — with role assignment, theme and vocabulary rotation, new member onboarding, PR export materials, and a weekly Roll Forward workflow that keeps the schedule current with minimal effort.

**Live:** [ronroeandassociates.github.io/vpe-preview](https://ronroeandassociates.github.io/vpe-preview/)

---

## What it does

- Generates 5 weekly meeting cards with roles, themes, and vocabulary pre-assigned
- Two-track role assignment: **speakers** rotate independently (no repeat within 3 meetings); **everyone else** advances through a skill ladder (Timer → Ah-Counter → Grammarian → Evaluator 3 → Evaluator 2 → Evaluator 1 → General Evaluator → Table Topics → Toastmaster)
- 72-month master theme library across 6 years of arcs and cycles
- New member onboarding: 7-step role ladder over 40 weeks from join date, with priority placement
- PR & Promotion exports per meeting: HTML banner, Facebook post, email, graphic text, Canva brief, guest invite, and a 5-visual creative prompt pack
- Session persistence: auto-saves to browser localStorage, plus manual save/load as a portable JSON file

---

## Weekly workflow (target: under 20 minutes)

### 1. After the meeting — update FreeToastHost

After each meeting, update the FTH agenda with what actually happened. FreeToastHost will then reflect accurate attendance, role completions, and the upcoming schedule.

### 2. Export from FreeToastHost

From your club's FTH portal, download:

| File | Report name in FTH |
|------|-------------------|
| `attendance.xlsx` | Meeting Attendance |
| `roletally.xlsx` | Meeting Role Tally |
| `schedule.xlsx` | Club Schedule |

Also download the current membership file from Toastmasters International:

| File | Source |
|------|--------|
| `Club-Membership[date].csv` | TI Club Central → Club Roster → Export |

### 3. Open the VPE Tool

Go to [ronroeandassociates.github.io/vpe-preview](https://ronroeandassociates.github.io/vpe-preview/)

If you saved a session last week, click **Load Session** and select your `.json` file. The tool restores your full state — members, officers, speaker history, schedule settings, and club identity — exactly where you left off.

### 4. Import the FTH files

Click **Import from CSV** in the sidebar to expand the import panel.

Drag and drop all four files (or click to browse). The tool auto-detects each file by name and column headers:

| File | What gets imported |
|------|--------------------|
| `Club-Membership*.csv` | Active members only (Paid Until ≥ today) · Officer pool from Current Position · New members from Member of Club Since |
| `attendance.xlsx` | Attendance counts per member — weights the rotation order |
| `roletally.xlsx` | Member names and role history |
| `schedule.xlsx` | Upcoming meeting dates, cadence, start date |

Click **Apply Import** to load the data into the schedule engine.

**Privacy:** Only member names are stored. Email addresses, phone numbers, and mailing addresses from the TI export are discarded immediately and never saved.

### 5. Roll Forward

Click **⏩ Roll Forward** in the header.

A confirmation panel appears showing exactly what will happen:

- Meeting 1 (the one that just happened) is archived
- Meetings 2–5 shift forward to positions 1–4
- A new Meeting 5 is generated from current roster and settings
- Speaker history updates — anyone who spoke in Meeting 1 is ineligible for the next 3 meetings
- Theme index advances by 1

Click **Confirm Roll Forward** to execute.

### 6. Review and adjust

Scan the five meeting cards. Meeting 1 and 2 are locked (confirmed). Meetings 3–5 are the adjustment window.

Make any changes needed:
- Edit the **Member Rotation Pool** in the sidebar to add, remove, or reorder members
- Edit the **Officer Pool** to update presiding officer assignments
- Add new members to the **New Member Onboarding** section with their join date
- Adjust the **Campaign / Program Note** for active campaigns (Beat the Clock, Smedley Award, etc.)

### 7. Export materials for the next meeting

On Meeting 1's card, click **📣 PR & Promotion Exports** to expand the export panel.

Open the outputs you need and click **Copy** next to each:

| Output | Use for |
|--------|---------|
| FreeToastHost HTML Banner | Paste into the FTH agenda header |
| Facebook / Social Post | Club Facebook page or group |
| Website Event Copy | Club website event listing |
| Member Email Announcement | Weekly club email |
| Graphic Text | Canva or social media graphic |
| Canva / Designer Brief | Send to club VPPR or designer |
| Short Guest Invitation | Text message or Messenger invite |
| Visual 1–5 Prompt Pack | AI image generation for graphics |

### 8. Save your session

Click **💾 Save Session** to download a `.json` file (named `vpe-[clubnumber]-[date].json`).

Store it somewhere you can find it next week — OneDrive, Google Drive, or a local folder. Load it at the start of your next session to pick up exactly where you left off.

---

## Sidebar reference

### Schedule Inputs

| Field | Description |
|-------|-------------|
| Club / Program Name | Your club name (appears on PR exports) |
| Planning Horizon | How many weeks to build (default: 5 weeks rolling) |
| Start Date | Date of the next upcoming meeting |
| Meeting Day | Day of week meetings are held |
| Meeting Time | Display time shown on PR exports |
| Meeting Cadence | Weekly, bi-weekly, 1st & 3rd Monday, etc. |
| Agenda Format Pattern | 3-1-1 (standard), hybrid, growth cycle, etc. |
| Presiding Officer Mode | Officer rotation, fixed president, etc. |

### Theme Library

| Field | Description |
|-------|-------------|
| Library Mode | Core (36-month) or Master (72-month full cycle) |
| Theme Start Position | Which theme to start from in the rotation |
| Vocabulary Difficulty | Mixed, Professional (standard), or Advanced |
| Repeat Protection | How many months before a theme can repeat |

### Member Rotation Pool

One name per line. Paste your member list or use Import. Order determines the rotation starting point.

### Officer Pool

One name per line. Used for Presiding Officer assignment based on the selected presiding mode.

### New Member Onboarding

Format: `Name | YYYY-MM-DD` (join date optional — omit to use today).

New members receive priority role placement through a 7-step ladder over their first 40 weeks:

1. Icebreaker Speech (weeks 0–3)
2. Timer (weeks 3–7)
3. Ah-Counter (weeks 7–11)
4. Grammarian (weeks 11–15)
5. Table Topicsmaster (weeks 15–22)
6. Evaluator (weeks 22–30)
7. General Evaluator (weeks 30–40)

### PR & Promotion

| Field | Description |
|-------|-------------|
| Club Number | Used in the HTML banner club line |
| Area / Division / District / Region | Used in the HTML banner club line |
| Meeting Link | Zoom or hybrid meeting URL (optional) |
| Active Campaign Name | Current TM campaign (e.g. Beat the Clock) |
| Campaign / Program Note | Override the meeting note in all PR exports |

---

## Role assignment logic

### Speaker track (independent queue)
- Speakers rotate through all members before repeating
- No speaker repeats within 3 meetings
- If the pool is exhausted (small club), falls back to longest-ago-first order
- Speaker history persists across sessions and Roll Forward cycles

### Progression track (skill ladder)
Non-speakers rotate through: **Timer → Ah-Counter → Grammarian → Evaluator 3 → Evaluator 2 → Evaluator 1 → General Evaluator → Table Topics → Toastmaster**

- Advances by one slot each meeting
- Members who are speaking that week are excluded from the progression pool for that meeting
- New members in the onboarding window get priority placement

---

## Multi-club use

Each club number gets its own localStorage slot. To switch between clubs:

1. Click **💾 Save Session** to save the current club
2. Click **Load Session** and select the other club's `.json` file

Naming convention: `vpe-148-2026-06-08.json`, `vpe-186-2026-06-08.json`

---

## Deployment

### GitHub Pages (current)

Deploys automatically on every push to `main` via `.github/workflows/pages.yml`.

After the first push, go to **Settings → Pages → Source** and select `gh-pages` branch.

### EC2 + nginx (future)

Trigger the **Build & Deploy to EC2** workflow manually from GitHub Actions.

Required secrets: `EC2_HOST`, `EC2_USERNAME`, `EC2_KEY`, `EC2_DEPLOY_PATH`

See `nginx.conf` for the server block configuration.

---

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve dist/ locally at http://localhost:4173
```

**Tech stack:** React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · Lucide React · SheetJS (xlsx)

---

## Data privacy

- All data is processed and stored locally in your browser
- No data is sent to any server
- Member names are the only personal data stored (in localStorage and session files)
- Email, phone, address, and other PII from TI membership exports are discarded immediately on import
- Session files (`.json`) are stored on your own device — you control them completely
