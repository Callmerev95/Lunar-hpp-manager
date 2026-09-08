# PRD — Lunar HPP Manager

Version: 1.0 — 2026-09-08
Status: Shipped (v1 live at https://lunar-hpp-manager.vercel.app)

## 1. Problem

Home-based food businesses in Indonesia (kue, snacks, frozen food) typically price their products by intuition rather than calculation. Ingredient prices fluctuate constantly — flour this month, eggs next month — but the selling price rarely moves, because the seller has no visibility into their actual cost per portion.

The consequences are invisible until they hurt: a price increase at the market quietly eats the margin; a "promo" price turns out to sell below cost. Existing tools (generic spreadsheets) demand accounting discipline most home sellers don't have, and SaaS alternatives are priced for businesses far larger than a home kitchen.

## 2. Goals

- Let a single home seller know, at any moment, the **true cost per portion** of each product they make
- Make it effortless to keep costs current — updating an ingredient price takes seconds, and every recipe recalculates automatically
- Provide a defensible **suggested selling price** from a margin the seller controls
- Keep the tool inside the seller's existing mental model: Indonesian language, familiar units (gram, ml, butir), currency in Rupiah

## 3. Non-goals (v1)

- Multi-user / team features — built for one owner (per-user data isolation via RLS, not shared workspaces)
- Labor and overhead costs — v1 covers materials + packaging only (the two costs sellers can actually track); designed to be extensible later
- Yield percentage / shrinkage adjustments
- Pagination, soft-delete, audit logs — single-user scale
- Public sharing of recipes or invoices

## 4. Target user

One home-based food seller (home baker). Non-technical. Mobile-first usage. Indonesian language UI. Tracks costs for a handful of products (dozens of ingredients, tens of recipes — not thousands).

## 5. User stories

1. As a home baker, I want to record ingredients and packaging with what I actually paid, so my costs reflect reality.
2. I want to record a new price for an ingredient when it changes, so HPP always uses the latest market price — and keep old prices for reference.
3. I want to compose a recipe from my materials, in the units I actually use, and see the cost per portion update live as I type.
4. I want a suggested selling price based on a margin I choose, so I don't underprice.
5. I want the breakdown (per-ingredient, subtotals, HPP total) exported to Excel, so I can keep records or share it.
6. I want my data to be mine — inaccessible to anyone else.

## 6. Functional requirements

- **FR-1 Auth** — email/password registration and login; session via Supabase; unauthenticated users redirected
- **FR-2 Materials** — create/edit/delete materials; each has a name, kind (`raw` ingredient or `packaging`), and buy unit (gram/kg/ml/liter/pcs); deletion blocked with a clear message if the material is referenced by a recipe
- **FR-3 Price history** — multiple price entries per material (`price`, `qty`, `unit`, `effective_at`); HPP uses the newest `effective_at` entry; entries can be deleted
- **FR-4 Recipes** — create/edit/delete recipes; each has a name, output quantity + unit, margin %, and ordered ingredient lines (material, quantity, unit); ingredient units must be dimension-compatible with the material's priced unit (kg vs pcs is rejected with a clear message)
- **FR-5 Cost calculation** — per-portion HPP = (Σ material cost + Σ packaging cost) ÷ output qty; unit prices normalized across dimensions; unpriced materials are excluded from totals and visibly flagged, never silently treated as free
- **FR-6 Pricing** — suggested selling price = per-unit HPP × (1 + margin %); margin is editable per recipe and on the detail page
- **FR-7 Dashboard** — all recipes with HPP per unit and suggested price, searchable
- **FR-8 Export** — recipe cost breakdown as XLSX (styled) and CSV (UTF-8 BOM, semicolon-delimited), generated server-side

## 7. Non-functional requirements

- **NFR-1 Security** — all tables behind Row Level Security; every row scoped `user_id = auth.uid()`; anon key is publishable by design
- **NFR-2 Performance** — sub-second TTFB on all routes in production; Lighthouse performance ≥ 93 (achieved: 93–100, CLS 0.000, TBT ≤ 85 ms); infra decisions documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **NFR-3 Correctness** — the cost engine is a pure, framework-free module with unit tests (23 tests) covering conversion, price normalization, packaging split, unpriced materials, and edge cases (zero output, missing prices)
- **NFR-4 UX** — Indonesian UI, mobile-responsive (all tables in overflow-scroll containers), form validation with clear Indonesian error messages
- **NFR-5 Maintainability** — cost logic isolated in `src/lib/costing/` with no framework dependencies; safe to refactor or port

## 8. Success criteria (measured at v1)

| Criterion | Result |
|---|---|
| Full CRUD for materials, prices, recipes | Shipped |
| HPP engine unit-tested | 23 tests passing |
| Lighthouse performance (all routes) | 93–100 |
| Dashboard TTFB (production) | 2.18 s → sub-second (parallel queries + region fix) |
| Export to Excel/CSV | Shipped, styled |

## 9. Open items / future

- Labor & overhead cost lines (v2 candidate)
- Yield % / shrinkage
- Ingredient price analytics over time
- Public repo screenshots (see README)
