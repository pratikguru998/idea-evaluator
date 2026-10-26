# Idea Evaluator

An interactive, private scorecard for answering *"Is this a real problem worth solving?"*

**Live:** https://pratikguru998.github.io/idea-evaluator/

- Score a business idea on **28 criteria** in 5 sections: problem, market, solution, economics, execution. Use a 1–5 scale and leave unknowns unscored.
- See it through **4 perspective lenses**: Customer, Investor, Founder/Operator, Competitor.
- Get a **verdict** with knockout rules, a **radar chart**, **red flags** and a **validate-next** list of cheap experiments.
- Save multiple ideas, **compare** up to 4 side by side, share via link, and export to Markdown, JSON or PDF.
- Fully static. Data never leaves your browser.

## Develop

```bash
npm install
npm start          # http://localhost:3000
npm test           # scoring unit tests
npm run build
```

Criteria live in `src/data/criteria.js`, lens weights in `src/data/lenses.js`, and scoring rules in `src/lib/scoring.js`.
Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
