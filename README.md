# Catatan HPP — Lunar HPP Manager

> Real cost per portion for home-based food businesses. Built for home bakers who price by intuition — and shouldn't.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-green)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![Vitest](https://img.shields.io/badge/Vitest-23%20tests-yellow)](https://vitest.dev)

**Live:** https://lunar-hpp-manager.vercel.app

## Why this exists

Home-based food businesses in Indonesia commonly price products by intuition — "sepertinya Rp3.000 per pcs" — without ever knowing the true cost of one portion. When flour or egg prices rise, margins silently evaporate, and nobody notices until the money is gone.

This app was built for exactly that scenario:

- Record what you **actually pay** for ingredients and packaging — with a price history, because market prices shift
- Compose a **recipe once**, with unit-aware quantities (bought 1 kg, used 250 g — it converts)
- Instantly see the **real cost per portion** and a **suggested selling price** at your desired margin
- Export the full breakdown to **Excel or CSV** for bookkeeping

No spreadsheets. No guesswork.

## Features

- **Email/password auth** with per-user data isolation (Postgres Row Level Security)
- **Materials & packaging** master data — raw ingredients vs. packaging, each with buy unit
- **Price history** — record new prices over time; HPP always uses the latest `effective_at` entry
- **Dimensional unit conversion** — mass (kg/g/gram), volume (liter/ml), count (pcs); recipes can't mix incompatible units
- **Recipe builder** with live HPP preview while typing (client-side cost engine, shared with server)
- **HPP breakdown** — raw materials vs. packaging subtotals, cost per portion, suggested selling price from a per-recipe margin %
- **Export** — styled XLSX (bold caramel headers, thousand separators) and CSV (UTF-8 BOM, `;` delimiter for Indonesian Excel)
- **Full CRUD** for materials, price entries, and recipes
- **Dark mode**, mobile-responsive, Indonesian UI

## Performance

Measured on production (Lighthouse 13, mobile throttling):

| Route | Performance | CLS | TBT |
|---|---|---|---|
| /login | 99 | 0.000 | 85 ms |
| /register | 99 | 0.000 | 38 ms |
| / (dashboard) | 93–98 | 0.000 | 12–43 ms |
| /materials | 97 | 0.000 | 29 ms |
| /recipes/new | 100 | 0.000 | 10 ms |

Sub-second TTFB on all routes after two deliberate fixes: parallelizing Supabase queries (sequential → one flight) and matching the Vercel function region to the database region. Full forensics in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tech stack

- **Next.js 16** (App Router, RSC, Server Actions, Turbopack) + **React 19** + TypeScript strict
- **Supabase** — Auth (email/password), Postgres with Row Level Security
- **Tailwind CSS 4** + shadcn/ui components, Nunito typeface
- **Vitest** — 23 unit tests covering the pure cost engine (unit conversion, price normalization, HPP)
- **xlsx-js-style** for styled Excel export
- Deployed on **Vercel** (function region matched to Supabase region)

## Getting started

```bash
git clone https://github.com/Callmerev95/Lunar-hpp-manager.git
cd Lunar-hpp-manager
npm install        # note: this project uses npm, not pnpm
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

Environment variables (`.env.local`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable anon key (safe client-side; RLS protects data) |
| `NEXT_PUBLIC_APP_URL` | App URL used for auth redirects |

Database schema lives in [`supabase/migrations/`](supabase/migrations/) — apply to your Supabase project before first use.

## Screenshots

<!-- Uncomment after adding captures to docs/screenshots/
![Dashboard](docs/screenshots/dashboard.png)
![Recipe detail](docs/screenshots/recipe-detail.png)
![Materials](docs/screenshots/materials.png)
-->

Coming soon.

## Project structure

```
src/
├── app/
│   ├── (auth)/          # login, register (server-rendered)
│   ├── (app)/           # dashboard, materials, recipes, export route
│   └── layout.tsx
├── components/
│   ├── materials/       # list, form, price history, delete dialog
│   ├── recipes/         # form (create/edit with live HPP preview)
│   └── ui/              # shadcn/ui
└── lib/
    └── costing/         # pure cost engine (unit-tested, framework-free)
```

The cost engine (`lib/costing/`) is pure TypeScript with zero framework imports — the same functions run in server components and the client-side live preview, and are covered by unit tests.

## Docs

- [`PRD.md`](PRD.md) — product requirements, user stories, scope
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — data model, cost engine design, infrastructure decisions

## License

[MIT](LICENSE)
