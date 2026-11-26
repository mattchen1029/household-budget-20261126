[![Hearth Budget](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/mattchen1029/household-budget-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/mattchen1029/household-budget-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# Hearth Budget

A household budget site a family can actually use — built for the [make.fun bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457).

Open `app/index.html` in a browser (or serve `app/` with any static server). It works on a desktop and on a phone, entirely offline: no accounts, no network requests, no build step.

## What it does

- **Dashboard** — the month's income, spending and what's left over, a spending-by-category donut chart, and income vs spending by month. Switch months to see October or November 2026.
- **Transactions** — add, edit and delete income and expenses, with date, category and note. Filter by category; the month selector changes the view.
- **Monthly budgets** — a limit per category with a progress bar, amount spent and amount left; limits are editable and update at once. Over-budget categories turn red.
- **Savings goals** — goals with target, saved amount and progress; add funds to a goal or start a new one.
- **Recurring bills** — bills with amounts and due days; mark each paid or unpaid and the totals update.

All figures are computed live from the data, and edits are saved in the browser (localStorage, with an in-memory fallback). The figures shown are clearly labelled example data for the Alvarez family — sample data for trying the site, not real-world statistics.

## Layout

- `app/index.html` — page shell, navigation, footer
- `app/main.js` — hash router and all event handling
- `app/views.js` — the five views (dashboard, transactions, budgets, goals, bills)
- `app/data.js` — example data, state, persistence and every calculation
- `app/charts.js` — hand-rolled SVG donut and bar charts
- `app/style.css` — the whole look, system fonts only
- `main.ts` — hands the site in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — real renders of the site

## Run it

```sh
# serve app/ and open http://localhost:8080
python3 -m http.server 8080 --directory app
# or, from the repo root:
node serve.ts   # if present; otherwise any static server works
```

## Hand-in check

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
