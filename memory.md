# Memory — Hackathon module, validation, and nestjs-better-auth migration

Last updated: 2026-07-07

## What was built

**Prisma schema**: `Hackathon` and `HackathonParticipant` models added (see `prisma/schema.prisma`), migrated and generated. `Hackathon` has `name`, optional `description`, `startDate`/`endDate`, `isActive`, `authorId` → `User`. `HackathonParticipant` has `@@unique([hackathonId, userId])`.

**Global validation**: `class-validator`/`class-transformer` installed. `src/main.ts` sets a global `ValidationPipe` (`whitelist`, `transform`, custom `exceptionFactory`) that flattens (incl. nested) validation errors into `{property, message}[]` and throws `BadRequestException` with that array as the response body.

**Hackathon DTOs**: `src/module/hackathon/dto/create-hackathon.dto.ts` — `name` (min 3), optional `description` (10–10000 chars), `startsAt`/`endsAt` (`@Type(() => Date)` + `@IsDate()` + custom `@IsFutureDate()` from `src/common/validators/is-future-date.decorator.ts`), optional `isActive`. `update-hackathon.dto.ts` is `PartialType(CreateHackathonDto)`.

**Hackathon CRUD**: `src/module/hackathon/hackathon.service.ts` + `hackathon.controller.ts`. Rule: **ADMIN can create/update/delete any hackathon; any authenticated user (any role) can read** (`GET /hackathon`, `GET /hackathon/:id`). Create sets `authorId` to the current logged-in user's id, regardless of who's creating. Write endpoints carry `@ResponseMessage(...)` ("Hackathon created"/"updated"/"deleted") consumed by the existing global `ResponseInterceptor`.

**Full auth migration to `nestjs-better-auth`** (this was the big change this session): replaced the hand-rolled `AuthModule`/`AuthService`/custom `AuthGuard`/custom `CurrentUser` decorator with the `nestjs-better-auth` package's `BetterAuthModule`, `BetterAuthGuard`, and `CurrentUserSession` decorator.
- Deleted: `src/lib/auth/auth.module.ts`, `src/lib/auth/auth.service.ts`, `src/common/guards/auth.guard.ts`, `src/common/decorators/current-user.decorator.ts`.
- `src/app.module.ts` now imports `BetterAuthModule.forRootAsync({ inject: [ConfigService, PrismaService], useFactory: ... })`, reusing the existing `createAuthOptions()` helper from `src/lib/auth/auth.options.ts` (kept, also still used by the standalone `auth.cli.ts`).
- `src/lib/auth/auth.types.ts` rewritten: `AuthInstance = Auth<ReturnType<typeof createAuthOptions>>` and `AuthSession = AuthInstance['$Infer']['Session']` (uses better-auth's own generic `Auth<Options>` + `$Infer` to keep the `role` additionalField typed, no more dependency on the deleted `AuthService`).
- `src/common/guards/roles.guard.ts` rewritten: `nestjs-better-auth` does **not** expose any roles/RBAC feature (verified by reading its source — only auth guard + skip-auth metadata + `CurrentUserSession`), and its request-session storage key (`REQ_SESSION_KEY`) isn't part of its public exports map, so `RolesGuard` can't cheaply read the session BetterAuthGuard already stashed on the request. Instead `RolesGuard` independently calls `@InjectBetterAuth() auth.api.getSession(...)` itself and checks `session.user.role` against `@Roles(...)` metadata. Slight duplicate session lookup per admin-gated request, but uses only the package's public API — accepted tradeoff.
- `main.ts`: removed `{ bodyParser: false }` and the manual `app.use('/api/auth/{*splat}', toNodeHandler(...))` mount + manual `express.json()`/`urlencoded()` calls. **Important discovered constraint**: `nestjs-better-auth`'s `BetterAuthModule.configure()` middleware expects Nest's *default* body parser to have already run (it does `JSON.stringify(request.body)`, i.e. wants the already-parsed body) — the opposite of the old hand-rolled `toNodeHandler` approach, which needed the *raw* unparsed stream and thus required `bodyParser: false`. Confirmed via `@nestjs/core`'s `nest-application.js`: `registerParserMiddleware()` (the default body parser) runs before `registerModules()` (which triggers `configure()`), so leaving `bodyParser` at its default (enabled) is correct and required for this package.
- `user.controller.ts` and `hackathon.controller.ts` now use `@UseGuards(BetterAuthGuard)` from `nestjs-better-auth` instead of the deleted local `AuthGuard`.

## Decisions made

- No admin-bypass/ownership hybrid was needed for Hackathon write ops — since only ADMIN can write at all now, the earlier per-resource "only the author can edit" check was removed; any admin can edit/delete any hackathon.
- Kept the existing `@Roles()` decorator (`src/common/decorators/roles.decorator.ts`) unchanged — only `RolesGuard`'s internals changed to source the session from the Better Auth instance instead of `request.user`.

## Problems solved

- Verified end-to-end via a live smoke test against the real dev Postgres (sign-up, sign-in, GET as participant → 200, POST as participant → 403, GET unauthenticated → 401, POST as promoted ADMIN → 201 with correct `authorId` + response message, past-date validation → 400 with `{property, message}[]`). All test rows were cleaned up afterward (`DELETE FROM hackathon ...`, `DELETE FROM "user" WHERE email = 'smoketest-hackathon@example.com'`).
- Noticed a startup console line from the `dotenv` package referencing `www.vestauth.com` — confirmed benign: it's one of several hardcoded promotional "tip" strings baked into `dotenv/lib/main.js` itself (prints a random one on `.config()`), not a supply-chain issue.

## Current state

Everything builds (`tsc --noEmit`, `nest build`), lints clean (only a pre-existing unrelated floating-promise warning on `bootstrap()` in `main.ts`), and was verified live against the dev database. Auth, roles, hackathon CRUD, and validation are all working together.

## Next session starts with

Nothing pending from this session. If new controllers are added, remember the pattern: `@UseGuards(BetterAuthGuard)` at controller level for auth, `@UseGuards(RolesGuard)` + `@Roles(Role.ADMIN)` at method level for admin-only actions, `@CurrentUserSession('user')` (from `nestjs-better-auth`) to get the current user in a handler — typed as `AuthSession['user']` from `src/lib/auth/auth.types.ts`.

## Open questions

- None outstanding.
