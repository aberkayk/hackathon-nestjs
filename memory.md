# Memory — Hackathon & HackathonParticipant Prisma models

Last updated: 2026-07-07

## What was built

Added two new models to `prisma/schema.prisma`:

- `Hackathon` — `name`, optional `description`, `startDate`/`endDate`, `isActive` (default `true`), `authorId`/`author` relation to `User` (onDelete: Cascade), `participants` relation to `HackathonParticipant`, timestamps. Mapped to table `hackathon`.
- `HackathonParticipant` — join model tracking which `User` joined which `Hackathon`, with `hackathonId`/`userId` relations (both onDelete: Cascade) and `joinedAt`. `@@unique([hackathonId, userId])` enforces one membership per user per hackathon. Mapped to table `hackathon_participant`.
- Added back-relations `hackathons` and `hackathonParticipants` on `User`.

Ran, in order: `npx prisma format`, `npx prisma migrate dev --name add_hackathon_and_participant` (created `prisma/migrations/20260707083706_add_hackathon_and_participant/`), `npx prisma generate` (regenerated client into `src/generated/prisma`). All succeeded against the remote `db.prisma.io` Postgres database.

## Decisions made

- IDs use `String @id @default(cuid())`, unlike the better-auth-managed models (`User`, `Session`, `Account`, `Verification`) which have app-assigned `String @id` with no default — this is intentional since Hackathon/HackathonParticipant are plain domain models, not better-auth entities.
- No NestJS module/service/controller was created for these models yet — only the schema, migration, and generated client. Per CLAUDE.md conventions, a real Hackathon feature module would go in `src/module/hackathon/` with its own service using constructor-injected `PrismaService`.

## Current state

Schema, migration, and generated Prisma client are in place and applied to the database. No application-layer code (module/service/controller/DTOs) exists yet for Hackathon or HackathonParticipant.

Also note: `src/module/user/user.controller.ts` shows as modified in git status from before this session (unrelated to this work, not investigated).

## Next session starts with

If a Hackathon feature module is wanted, scaffold `src/module/hackathon/` (module, service, controller) following the existing `src/module/user/` pattern, using the injected `PrismaService` from `src/lib/database/prisma.service.ts`.

## Open questions

- Whether a NestJS module/controller/service for Hackathon endpoints (create/join/list) is wanted next, or if the schema-only change was the full scope of this task.
