# Squisher

Backend / REST API for the Squisher link shortener — link creation, redirects, click tracking and cookie-based auth on NestJS + Prisma.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)

**[API docs](https://squisher-be.vercel.app/api-docs)** · **[Frontend repo](https://github.com/metwoOSha/Squisher_FE)**

## Highlights

- **Ownership without a login.** A visitor who shortens a URL gets a `nanoid(7)` `anonId` cookie, and links are owned by that cookie until they register — at which point new links attach to the account instead. [`links.service.ts`](src/links/links.service.ts) resolves an owner once (`ownerOf`) and every read narrows to it, so a caller with no session at all gets an empty list rather than the table.
- **Per-owner deduplication.** Shortening a URL you already shortened returns your existing code instead of minting a second one — scoped to the caller, so two people shortening the same URL each get their own link and their own click counts.
- **Explicit column selection.** Reads select `id / shortCode / originalUrl / createdAt` only. `userId` and `anonId` identify a visitor's session and never leave the server, which a raw Prisma model would have handed out.
- **Click counts come with the list.** `GET /links` aggregates through Prisma `_count`, so a client renders a full list from one request instead of one `/stats` call per link — the difference between one request and N+1 against a 10 req/min throttle.
- **Short links resolve at the root.** [`redirect.controller.ts`](src/links/redirect.controller.ts) serves a bare `GET /:shortCode`, which matches any single-segment path — including routes mounted after it. Anything not shaped like a `nanoid(7)` code is handed back to the router with `next()` rather than answered with a 404, so `/api-docs` stays reachable. `GET /links/:shortCode` still works, so links copied out earlier keep resolving.
- **Cookies that survive a cross-origin frontend.** [`cookie.config.ts`](src/config/cookie.config.ts) switches the auth and anon cookies to `SameSite=None; Secure` in production, since a `Lax` cookie is not sent on a cross-site fetch, and keeps `Lax` over plain http in dev. CORS is credentialed and driven by an explicit origin list.
- **Rate limiting in front of everything**, via a global `ThrottlerGuard` (10 req/min), tightened to 5 req/min on register and login.

## Stack

- **Framework:** NestJS 11 (Express platform), TypeScript (ESM)
- **ORM:** Prisma 7 (`prisma-client` generator) + `@prisma/adapter-pg`
- **Database:** PostgreSQL (Neon)
- **Auth:** `@nestjs/jwt`, `passport-jwt` reading the token from a cookie, `bcrypt`, `cookie-parser`
- **Validation:** `class-validator` / `class-transformer` through a global `ValidationPipe`
- **Docs:** Swagger (`@nestjs/swagger`) at `/api-docs`
- **Rate limiting:** `@nestjs/throttler`
- **Tooling:** oxlint, Prettier, Vitest

## Project structure

```
prisma/
├── models/           # schema split by domain: link, click, user
├── migrations/       # SQL migration history
└── schema.prisma     # generator + datasource
src/
├── auth/             # controller, service, DTOs, JwtAuthGuard, passport strategy
├── links/            # LinksController (/links), RedirectController (/:shortCode), service, DTOs
├── users/            # user lookups, password never selected out
├── prisma/           # PrismaService (pg adapter)
├── config/           # cookie options, Swagger config
├── app.module.ts     # throttler + module wiring (LinksModule last: it owns the catch-all route)
└── main.ts           # bootstrap, ValidationPipe, cookie-parser, CORS, Swagger
```

## Prerequisites & running locally

- Node.js 20+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) instance)

**Environment variables** (`.env`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret used to sign and verify the auth JWT |
| `EXPIRES_IN` | Lifetime of that JWT, e.g. `7d` |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API with cookies. Required in production; in dev it defaults to `http://localhost:5173` |

**Setup:**

```bash
npm install
cp .env.example .env

npx prisma migrate dev     # apply migrations
npm run start:dev          # watch mode
```

The API listens on `http://localhost:3000`, Swagger on `/api-docs`.

Production build:

```bash
npm run build       # prisma generate && nest build
npm run start:prod  # node dist/main
```

## API endpoints

### `/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create a user, sets the auth cookie | — |
| POST | `/auth/login` | Authenticate, sets the auth cookie | — |
| POST | `/auth/logout` | Clear the auth cookie | — |
| GET | `/auth/me` | Current user (`id`, `email`, `createdAt`) | Required |

### `/links`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/links` | Shorten a URL; issues the `anonId` cookie for a guest | — |
| GET | `/links` | Links owned by the caller, with click counts | Cookie |
| GET | `/links/:shortCode` | Redirect and record a click | — |
| GET | `/links/:shortCode/stats` | Click statistics for one link | — |

### Root

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/:shortCode` | Redirect and record a click — the short link people share | — |

## Lint & testing

```bash
npm run lint      # oxlint
npm run format    # prettier --write "src/**/*.ts"
npm test          # vitest
```

Vitest is wired up (`test`, `test:watch`, `test:cov`, `test:e2e`) but no specs are written yet.
