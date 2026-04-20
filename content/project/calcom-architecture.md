---
title: "Cal.com"
subtitle: "Open-Source Scheduling Infrastructure"
description: "A modular, extensible scheduling platform built with Next.js, tRPC, and PostgreSQL. Architected an App Store pattern for third-party integrations and end-to-end type safety across the stack."
date: "2026-04-14"
tags:
  - System Design
  - Next.js
  - TypeScript
github: "https://github.com/sharma0x"
---

When I started building **Cal.com** (formerly Calendso), the mission was simple: scheduling is a universal, infrastructural layer of the internet, and tying it to closed-source, deeply coupled, proprietary walled gardens was fundamentally limiting for developers.

We didn't just want to build an alternative to Calendly; we wanted to build the *Stripe for time*. We needed an open-source scheduling infrastructure that was robust enough for extreme enterprise multi-tenancy, yet modular enough for developers to embed and customize limitlessly.

In this post, I want to take you through the technical journey, the architectural decisions, and the deep system design that powers Cal.com today.

## 1. The Monorepo Foundation (Turborepo)

From day one, I knew Cal.com was going to be more than a single web application. Between our primary booking application, our REST APIs (for headless integrations), embed scripts, and various micro-utilities, a monolithic codebase would eventually become a nightmare to test, deploy, and scale.

We adopted a **Turborepo-powered Monorepo** architecture.

This structural decision enabled massive modularity. We decoupled our core business logic into highly scoped `packages` while exposing them via `apps`.

```typescript title="Monorepo Structure"
apps/
  web/          # Core Next.js app
  api/          # Decoupled REST API
packages/
  prisma/       # DB schema & migrations
  trpc/         # Type-safe API routers
  ui/           # Tailwind design system
  features/     # Domain-driven business logic
  app-store/    # Third-party integrations
```

By structuring the codebase this way, we isolated dependencies and maximized cacheable CI/CD pipelines, resulting in incredibly fast developer velocity despite possessing an enterprise-scale codebase.

## 2. Breaking the Monolith: The "App Store" Pattern

One of the largest engineering hurdles in scheduling is the **combinatorial explosion of integrations**. Users don't just want Google Calendar—they want Outlook, CalDAV, Apple Calendar, Zoom, Microsoft Teams, Daily.co, Stripe, and HubSpot.

Hard-codifying these integrations deeply into the core scheduling engine would have resulted in bloated, fragile spaghetti code.

**Our Solution: The App Store Architecture (`packages/app-store`).**

We abstracted integrations away from the core scheduler and built an internal plugin system. Each third-party integration is an isolated "App." We rely heavily on the **Open-Closed Principle (OCP)**.

When a user creates a booking, our core engine triggers an asynchronous *Video/Calendar Creation Pipeline*. The platform checks the `Credential` table, polymorphically figures out which APIs the user has enabled, and dynamically hydrates the respective classes instance (e.g., `GoogleCalendarService`). The core system doesn't need to know *how* Google Calendar creates an event, it only cares that the app returns an object matching our `CalendarEventResponse` interface.

This decoupling allowed our open-source contributors to build out dozens of integrations without ever touching or threatening the core scheduling algorithm.

## 3. End-to-End Type Safety: Next.js, tRPC, and Zod

For a project processing healthcare compliance (HIPAA), SOC2 requirements, and financial payments, runtime type errors are unacceptable. Our commitment to strict Type-Safety spans the entire stack.

We heavily leverage **tRPC** for our Web application to communicate with our server. By utilizing tRPC, traditional REST serialization vulnerabilities and mismatches vanish; our frontend inherently knows the exact TypeScript return shape of a database query without defining an explicit API spec.

```typescript title="tRPC Router Example"
const bookingRouter = router({
  getByDay: protectedProcedure
    .input(z.object({ date: z.date(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.booking.findMany({
        where: { date: input.date, userId: input.userId },
      })
    }),
})
```

Underpinning tRPC mutations is **Zod**. Every piece of data entering our system—whether hitting our REST API or internal tRPC router—is strictly evaluated against Zod schemas.

## 4. Modeling Time: The Database Schema

Booking time across multiple human beings is shockingly difficult. You have to intercept timezones, daylight savings, multi-party working hours, and physical calendar conflicts. Our PostgreSQL database is the workhorse here.

To support dynamic **Round-Robin** and **Collective** scheduling organically, we had to model our schema intelligently:

- `EventType`: Represents the parameters of the meeting (duration, buffers, locations, strict limits like "max 2 per day").
- `Host` and `HostGroup`: These pivot tables dynamically map multiple physical users to an `EventType`.
- `Profile` and `Team`: We architected extreme multi-tenancy. A single `User` account can belong to multiple distinct organizations (`Teams`), seamlessly maintaining distinct organizational aliases, workflows, and branding.

### Kysely for High-Performance Queries

While **Prisma** gives us incredible Developer Experience (DX) for 90% of our CRUD operations, fetching slot availability across large teams with complex filtering bounds can result in N+1 nightmares or inefficient SQL generation. For those highly optimized read paths, we utilize **Kysely** via the `prisma-kysely` integration.

## 5. Performance at Scale (Redis & Task Queues)

At scale, the booking frontend becomes a very expensive read-heavy application. Calculating availability requires merging a user's static `Schedule` logic with live API polling requests to external calendars (Google, Outlook) to detect conflicting events.

- **Caching via Upstash Redis**: We aggressively cache slot queries, availability meshes, and rate-limits.
- **Event-Driven Webhooks**: Booking states are essentially state machines (`PENDING` -> `ACCEPTED` -> `CANCELLED`). We utilize an internal event subscriber queue combined with asynchronous task runners to handle heavy lifters out-of-band.

## Final Thoughts

Building Cal.com wasn't just about writing code that puts events on a calendar. It was about creating an infrastructural architecture capable of stretching from a solo freelancer to enterprise organizations requiring strict HIPAA compliance, all while maintaining an open-source ethos.

Extensibility, rigid type boundaries, and domain isolation allowed us to scale the codebase effortlessly alongside a global ecosystem of contributors. The internet doesn't need more walled gardens; it needs modular infrastructure. And that's exactly what the architecture of Cal.com was engineered to be.