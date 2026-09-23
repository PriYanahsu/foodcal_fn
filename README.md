# FoodCal — Frontend

Photograph a meal, get its calories and macros, and track them against a plan the app
computes rather than guesses.

**Live:** https://foodcal-fn-three.vercel.app/ · **Backend:** https://github.com/krixen-org/foodCal_be

---

## What it does

- **Log a meal from a photo.** Point the camera at a plate; the app identifies the dish, breaks
  it into components, and estimates calories, protein, carbs and fat — with a confidence score
  and a note on what it assumed.
- **Build a personal plan.** A setup wizard takes body stats, activity level, goal weight and a
  target date, then computes a daily calorie and macro target, refusing timelines that would be
  unsafe and explaining why.
- **Track the day.** Dashboard of calories eaten versus target, macro rings, meals logged,
  water intake and a weigh-in field.
- **Look back.** A calendar of logged days, drilling into any day and any individual meal.
- **Watch progress.** Weight chart built from daily weigh-ins against the goal line.
- **Install it.** A PWA, so it goes on a phone home screen and still opens offline.

## System architecture

```
   ┌──────────────────────────────────────────────┐
   │  Browser  ·  Next.js PWA + service worker    │
   └───────┬─────────────────────────┬────────────┘
           │                         │
   Next route handlers        Axios + JWT
   (server-side only)                │
           │                         ▼
           ▼               ┌──────────────────────┐
   ┌───────────────┐       │  Spring Boot API     │
   │  Gemini API   │       │  auth · food · plan  │
   │  vision +     │       └───┬──────────────┬───┘
   │  coach copy   │           │              │
   └───────────────┘           ▼              ▼
                        ┌────────────┐  ┌──────────────┐
                        │ PostgreSQL │  │  Supabase    │
                        │  (Flyway)  │  │  Storage     │
                        └────────────┘  └──────────────┘
```

Two rules hold this together. **The Gemini key never leaves the server** — AI calls go through
Next route handlers, never from the browser. And **the browser never talks to Postgres or
Supabase directly** — every read and write goes through the Spring Boot API, which checks the
JWT and the row's owner first.

---

## The one idea worth knowing

FoodCal deals with two kinds of numbers, and it treats them completely differently.

**Estimates** — what's in this photo — genuinely need a model. A bowl of biryani has no
barcode. These come from Gemini, and the app is honest that they're estimates: it shows a
confidence score and refuses to log anything it isn't reasonably sure about.

**Commitments** — your calorie target, your macro split, how fast you can safely lose weight —
must never come from a model. Language models are unreliable arithmetic engines, and these are
numbers a user will hold themselves to for months. They're computed in TypeScript in
[`src/lib/nutrition/plan.ts`](src/lib/nutrition/plan.ts) from published formulas. The model is
handed the finished numbers and asked only to explain them in plain language.

Almost every design decision below follows from that split.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Server state | TanStack Query |
| Animation | Framer Motion |
| AI | Google Gemini (`@google/generative-ai`) |
| API | Spring Boot backend over Axios |
| Push | Web Push + a hand-written service worker |

---

## Quick start

**Prerequisites:** Node 20+, and the [backend](https://github.com/krixen-org/foodCal_be)
running locally (or point at the deployed one).

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Required | What it's for |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | yes | Base URL of the Spring Boot API, no trailing slash |
| `GEMINI_API_KEY` | yes | Server-side only. Powers `/api/analyze-food` and `/api/fitness-consultant` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | no | Web Push subscription key. Push is inert without it |
| `PUSH_INTERNAL_SECRET` | no | Shared secret so a cron job can call `/api/send-push` |

`GEMINI_API_KEY` has no `NEXT_PUBLIC_` prefix deliberately — it is read only inside route
handlers and never reaches the browser.

> **A note on `npm run dev`.** The scripts run Next through
> `node --use-system-ca`. On machines where antivirus software intercepts HTTPS, Node
> otherwise rejects Google's certificate and every AI call fails with
> `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. If you see that error, you started the server some other way.

---

## How a scan works

```
Camera / file picker
   └─ POST /api/analyze-food          (Next route handler, server-side)
        ├─ Gemini call, constrained by a responseSchema
        ├─ re-adds the per-ingredient breakdown server-side
        ├─ checks totals against the 4/4/9 kcal identity
        └─ rejects below 0.35 confidence  → 422, no log written
   └─ user reviews and can correct the estimate
   └─ POST /api/v1/food/{userId}      (Spring Boot, multipart: photo + JSON)
        └─ photo to Supabase Storage, row to PostgreSQL
```

Three things make that pipeline more than a wrapper around an API call:

1. **The schema carries the contract.** Field descriptions live in the `responseSchema`, not in
   the prompt text — that's Google's own guidance. The prompt is left to describe *method*:
   how to establish physical scale from a plate or a fork, that deep-frying adds 8–15 g of oil
   per 100 g, that regional dishes must be costed by their own recipe rather than a Western
   lookalike.
2. **The server re-does the arithmetic.** Models frequently itemise correctly and then fluff the
   total. `reconcile()` re-adds the components and corrects the totals.
3. **Low confidence is an error, not a number.** Below 0.35 the route returns 422 with a message
   asking for a better photo. A wrong high-confidence number costs the user their whole day of
   tracking, so the model is instructed to calibrate rather than be polite.

Free-text meal notes ("grilled, not fried") are delimited and explicitly labelled as data about
the food — never instructions — to keep user input from rewriting the analysis rules.

---

## AI route reliability

[`src/lib/gemini/client.ts`](src/lib/gemini/client.ts) is shared by both AI routes.

- **No hardcoded model ID.** It calls Gemini's ListModels at runtime and ranks what comes back:
  stable before preview, newest generation first, Flash before Flash-Lite before Pro. Results
  are cached 30 minutes, with a static list as a fallback if ListModels is unreachable.
- **Failover.** `generateJson` walks the top candidates and returns the first parseable reply.
  A quota, deprecation or overload error simply moves to the next model. If all fail, the thrown
  error names each failure.
- **TLS errors break out early** — a local certificate problem will fail identically on every
  model, so retrying just delays the user's error message.
- **Sampling matches the model generation.** Gemini 2.x gets a low temperature, which helps
  extraction work; Gemini 3 is left at its default, since it's documented to degrade below 1.0.

---

## Project structure

Feature-first: a feature owns its components, hooks, types and helpers, and shared code only
moves up when a second feature needs it.

```
src/
├─ app/
│  ├─ (site)/            route group — every authenticated page
│  ├─ api/               route handlers (AI calls, push)
│  └─ service/           typed API clients + TanStack Query keys
├─ features/             self-contained domains
│  ├─ food-scan/         camera, capture, review
│  ├─ Nutrition/         daily dashboard
│  ├─ fitnessProfile/    setup wizard + the plan view
│  ├─ history/           calendar and per-day drill-in
│  ├─ notifications/     permission, subscription, in-app panel
│  └─ auth/ settings/ userProfile/ …
├─ components/           shared UI (Button, Card, BottomSheet, …)
├─ lib/
│  ├─ nutrition/plan.ts  the deterministic calorie engine
│  ├─ gemini/client.ts   model discovery + failover
│  └─ springboot/        axios instance, token storage
└─ config/features.ts    feature flags
```

---

## Authentication

The backend issues a JWT access token and a refresh token.

- Tokens live in `localStorage`, and are **mirrored into cookies** so
  [`middleware.ts`](src/middleware.ts) can gate routes before a page renders — middleware runs on
  the edge and cannot read `localStorage`.
- A response interceptor in [`axios.ts`](src/lib/springboot/axios.ts) catches a 401, refreshes
  once, and replays the original request. The refresh is **single-flight**: concurrent 401s share
  one in-flight refresh promise rather than each firing their own.
- If refresh fails, tokens are cleared and the user lands on `/login`.

The middleware check is a redirect for UX, not a security boundary — every protected route is
enforced by the backend on each request.

---

## Cold starts

The backend runs on a free tier that sleeps. A request interceptor holds outgoing calls until
the server answers, instead of firing them into a 502, and a banner tells the user what's
happening. Any real HTTP response — even a 400 — is treated as proof the JVM is awake.

---

## Feature flags

[`src/config/features.ts`](src/config/features.ts) is the single switch per feature. Flipping one
to `false` removes it from navigation **and** redirects its route in middleware, so a disabled
feature isn't reachable by typing the URL.

Currently off: `exercises`, `steps`.

---

## PWA

[`public/sw.js`](public/sw.js) is hand-written rather than generated:

- navigation requests — network first, falling back to cache when offline
- images, scripts, styles — stale-while-revalidate
- `/_next/` and cross-origin requests are left alone, since Next fingerprints its own assets
- push and notification-click handlers live in the same worker

---

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve the build
npm run lint     # eslint
npm run format   # prettier
```

---

## Deployment

Vercel. Set the environment variables above in the project settings, and make sure
`FRONTEND_URL` on the backend includes the deployed origin or CORS will reject every call.

---

## Known gaps

Honest list of what isn't finished:

- **Push delivery is not wired up.** Subscription, the service worker and the UI all work, but
  `/api/send-push` and `/api/check-notifications` return "not configured" — there's no server
  scheduling reminders yet.
- **`/api/scan` is a stub** returning mock data. The real path is `/api/analyze-food`.
- **Step tracking** is an accelerometer-based counter that stores to `localStorage` only. Flag off.
- **`docs/` is stale.** Those files describe an earlier version backed entirely by Supabase auth
  and database. Auth and data now live in the Spring Boot service; Supabase is object storage
  only. Trust this README over `docs/`.
