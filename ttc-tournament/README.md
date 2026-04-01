# 🏓 IIT TTC April Tournament 2026

Live bracket tracker for the Illinois Tech Table Tennis Club April 2026 tournament.

## How to deploy to GitHub Pages

1. **Create a new GitHub repo** (e.g. `ttc-tournament-2026`)
2. **Upload all these files** — keep the folder structure exactly as-is:
   ```
   index.html
   bracket.html
   schedule.html
   results.html
   css/style.css
   js/data.js
   js/state.js
   ```
3. Go to **Settings → Pages** in your repo
4. Under "Source", select **Deploy from a branch** → `main` → `/ (root)`
5. Hit Save — your site will be live at `https://<your-username>.github.io/<repo-name>/`

## How to share with execs

Once deployed, any URL with a `#` hash in it encodes the full bracket state.  
After entering results, just copy the URL from the address bar and share it.  
Your execs open that URL and they see **exactly the same bracket state** — no login, no server.

The site also saves to localStorage as a backup so you don't lose progress if you accidentally close the tab.

## Pages

| Page | What it does |
|------|-------------|
| `index.html` | Overview, roster, tournament progress |
| `schedule.html` | Day-by-day match list, enter scores here |
| `bracket.html` | Visual bracket (Winners + Losers), click matches to enter scores |
| `results.html` | Podium, division winners, match history |

## Tournament info

- **Format:** Double elimination, 27 players in a 32-slot bracket (5 byes)
- **Seeding:** Advanced (seeds 1–9) → Intermediate (10–23) → Beginner (24–27)
- **Scheduling constraints:**
  - Obafemi Omoniyi (Zuzu, seed #3): Wednesday & Friday only
  - Pavle Veselinovic (seed #22): Must play before 1:50 PM

## Data persistence

State is stored in two places:
- **URL hash**: Base64-encoded bracket state — shareable, syncs between devices
- **localStorage**: Backup for same-browser sessions

To sync between devices/execs: just copy and share the URL after any update.
