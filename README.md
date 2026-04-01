# 🏓 IIT TTC April Tournament 2026

Live bracket tracker — double elimination, 27 players, 3 days.

---

## 🚀 How to deploy (GitHub Pages)

1. **Create a new GitHub repo** (e.g. `ttc-tournament-2026`)
2. **Upload ALL these files to the root** — no subfolders needed:
   ```
   index.html
   schedule.html
   bracket.html
   results.html
   style.css
   data.js
   state.js
   README.md
   ```
3. Go to **Settings → Pages → Source** → Deploy from branch → `main` → `/ (root)` → Save
4. Your site will be live at: `https://<username>.github.io/<repo-name>/`

---

## 🔴 IMPORTANT: Set up real-time sync (Firebase)

By default, the site syncs state via URL hash (copy/paste the URL to share).
For **automatic real-time sync** (all devices update instantly without sharing a URL):

### Step 1 — Create a Firebase project (free)
1. Go to https://console.firebase.google.com/
2. Click **Add project** → name it (e.g. `ttc-april-2026`) → Continue
3. Disable Google Analytics if you want → Create project

### Step 2 — Enable Realtime Database
1. In the sidebar: **Build → Realtime Database → Create database**
2. Choose a region → **Start in test mode** → Enable
3. (Test mode is fine — data is not sensitive, just scores)

### Step 3 — Get your config
1. Sidebar: ⚙️ **Project Settings** (gear icon) → **General** tab
2. Scroll down to **Your apps** → click **</>** (Web) → register an app
3. Copy the `firebaseConfig` object shown

### Step 4 — Paste config into `state.js`
Find this block near the top of `state.js` and replace with your real values:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",              // ← replace
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Save `state.js` and re-upload to GitHub.

**That's it!** All devices will now see score updates within 1-2 seconds automatically.

---

## 📱 How to share with execs

Once deployed, just share the URL:
```
https://<username>.github.io/<repo-name>/
```

All execs open the same URL → all see the same bracket live.

If Firebase isn't set up yet, you can still share state via URL:
- After entering a score, click **📋 Share** button
- The URL hash encodes the full bracket state
- Anyone opening that URL sees the exact same state

---

## 📄 Pages

| Page | What it does |
|------|-------------|
| `index.html` | Home, roster, tournament progress overview |
| `schedule.html` | Day-by-day match list, enter scores here |
| `bracket.html` | Visual WB + LB bracket, click matches to score |
| `results.html` | Podium, division winners, full match history |

---

## 🏆 Tournament format

- **Format:** Double elimination, 27 players in a 32-slot bracket (5 byes)
- **Seeding:** Advanced (seeds 1–9) → Intermediate (10–23) → Beginner (24–27)
- **Byes:** Vaughn (#1), Jay (#5), Nicolas (#4), Obafemi/Zuzu (#3), Jakub (#2)
- **Days:** Apr 1 (Wed) = WB R1 · Apr 2 (Thu) = WB R2 + LB R1/R2 · Apr 3 (Fri) = everything else

### ⚠️ Scheduling constraints
- **Obafemi Omoniyi (Zuzu), Seed #3** — Available **Wednesday & Friday ONLY** (not Thursday)
  → His WB R2 match (WB-R2-M5) is scheduled Friday
- **Pavle Veselinovic, Seed #22** — Must play **before 1:50 PM** on any match day
  → Schedule WB-R1-M11 (Hasan vs Pavle) **first** on Wednesday

---

## 💾 Data persistence

State is stored in two places simultaneously:
- **Firebase** (if configured): live sync to all devices within ~1-2 seconds
- **URL hash**: base64-encoded bracket state — shareable between devices
- **localStorage**: backup for same-browser sessions

Priority on load: URL hash → localStorage → empty state
