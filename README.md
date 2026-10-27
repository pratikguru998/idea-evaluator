# Idea Evaluator

An interactive, private workspace that takes a business idea through three phases: **① validate the idea → ② design value & business model → ③ craft an irresistible offer**.

**Live:** https://pratikguru998.github.io/idea-evaluator/

- Score a business idea on **28 criteria** in 5 sections: problem, market, solution, economics, execution. Use a 1–5 scale and leave unknowns unscored.
- Build **user personas** (profile cards with goals, frustrations, behaviour sliders, buying role).
- Design a **Value Proposition Canvas** with fit scoring, an interactive fit matrix, ad-lib statements, a great-VP checklist and test cards.
- Map the whole business on a **Business Model Canvas**: sticky notes, assumption vs validated, monthly economics, and pre-fill from other tabs.
- Build a **Grand Slam Offer** ($100M Offers method): starving crowd, value equation, problems → solutions, delivery vehicles, trim & stack, scarcity, urgency, bonuses, guarantee and MAGIC naming.
- Size the market with a **TAM / SAM / SOM** calculator and chart (bottom-up or top-down, with a revenue-goal check).
- Analyse the industry with **Porter's Five Forces** and the strategy with the **3C model** (Customers · Company · Competitors).
- See it through **4 perspective lenses**: Customer, Investor, Founder/Operator, Competitor.
- A full-width **Report** tab with large charts.
- Get a **verdict** with knockout rules, a **radar chart**, **red flags** and a **validate-next** list of cheap experiments.
- Save multiple ideas, **compare** up to 4 side by side, share via link, and export to Markdown, JSON or PDF.
- **Save to Google Drive**: one click writes the idea to a `Idea Evaluator` folder in your Drive as a Google Doc (the full report) plus a `.json` backup you can re-import. Saving again updates the same two files.
- Fully static. Data stays in your browser unless you click **Save to Google Drive**, which sends it straight from your browser to your own Drive.

## Develop

```bash
npm install
npm start          # http://localhost:3000
npm test           # scoring unit tests
npm run build
```

### Google Drive setup

The **☁️ Save to Google Drive** button needs a Google OAuth client ID (public, not a secret). The app asks only for the `drive.file` scope, so it can see the files it created and nothing else in your Drive.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Google Drive API**.
2. Under **Google Auth Platform → Branding/Audience**, set up the consent screen (External, Testing). Add your Google account as a test user.
3. Under **Clients**, create an **OAuth client ID** of type *Web application*. Add these **Authorized JavaScript origins**: `http://localhost:3000` and `https://pratikguru998.github.io`.
4. Local: `GOOGLE_CLIENT_ID=<id> npm start`. For deploys, add a repository variable named `GOOGLE_CLIENT_ID` (Settings → Secrets and variables → Actions → Variables). The workflow passes it to the build.

The code is in `src/lib/drive.js`. It remembers the folder and file ids for each idea in localStorage (`idea-evaluator:drive`), so a re-save overwrites the same Doc and JSON. If you delete them in Drive, the next save creates fresh ones.

Criteria live in `src/data/criteria.js`, lens weights in `src/data/lenses.js`, and scoring rules in `src/lib/scoring.js`.
Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
