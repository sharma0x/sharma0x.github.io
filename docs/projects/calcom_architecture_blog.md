---
title: "Building Cal.com: The Open-Source Scheduling Infrastructure for the Web"
date: "2026-04-14"
tags: ["System Design", "Architecture", "Open Source", "Next.js", "TypeScript", "PostgreSQL"]
summary: "A deep dive into the system design, modular architecture, and extreme extensibility patterns we used to build Cal.com, the open-source alternative to Calendly."
---

# Building Cal.com: The Open-Source Scheduling Infrastructure for the Web

When I started building **Cal.com** (formerly Calendso), the mission was simple: scheduling is a universal, infrastructural layer of the internet, and tying it to closed-source, deeply coupled, proprietary walled gardens was fundamentally limiting for developers. 

We didn't just want to build an alternative to Calendly; we wanted to build the *Stripe for time*. We needed an open-source scheduling infrastructure that was robust enough for extreme enterprise multi-tenancy, yet modular enough for developers to embed and customize limitlessly.

In this post, I want to take you through the technical journey, the architectural decisions, and the deep system design that powers Cal.com today.

---

## 1. The Monorepo Foundation (Turborepo)

From day one, I knew Cal.com was going to be more than a single web application. Between our primary booking application, our REST APIs (for headless integrations), embed scripts, and various micro-utilities, a monolithic codebase would eventually become a nightmare to test, deploy, and scale.

We adopted a **Turborepo-powered Monorepo** architecture. 

This structural decision enabled massive modularity. We decoupled our core business logic into highly scoped `packages` while exposing them via `apps`.

*   **Primary Apps (`/apps`)**: 
    *   `apps/web`: The core Next.js application containing our admin dashboard, public booking pages, and routing flows.
    *   `apps/api`: A decoupled API server handling our public REST API (v1/v2).
*   **Core Packages (`/packages`)**:
    *   `packages/prisma`: Our single source of truth for the database schema, Prisma generated clients, and migrations.
    *   `packages/trpc`: Our type-safe internal API routers.
    *   `packages/ui`: Our strict, Tailwind-driven design system.
    *   `packages/features`: Domain-driven modular business logic (e.g., event-limits, dynamic scheduling logic).
    *   `packages/app-store`: The heart of our extensibility (more on this below).

By structuring the codebase this way, we isolated dependencies and maximized cacheable CI/CD pipelines, resulting in incredibly fast developer velocity despite possessing an enterprise-scale codebase.

---

## 2. Breaking the Monolith: The "App Store" Pattern

One of the largest engineering hurdles in scheduling is the **combinatorial explosion of integrations**. Users don't just want Google Calendar—they want Outlook, CalDAV, Apple Calendar, Zoom, Microsoft Teams, Daily.co, Stripe, and HubSpot. 

Hard-codifying these integrations deeply into the core scheduling engine would have resulted in bloated, fragile spaghetti code. 

**Our Solution: The App Store Architecture (`packages/app-store`).**

We abstracted integrations away from the core scheduler and built an internal plugin system. Each third-party integration is an isolated "App." We rely heavily on the **Open-Closed Principle (OCP)**. 

When a user creates a booking, our core engine triggers an asynchronous *Video/Calendar Creation Pipeline*. The platform checks the `Credential` table, polymorphically figures out which APIs the user has enabled, and dynamically hydrates the respective classes instance (e.g., `GoogleCalendarService`). The core system doesn't need to know *how* Google Calendar creates an event, it only cares that the app returns an object matching our `CalendarEventResponse` interface. 

This decoupling allowed our open-source contributors to build out dozens of integrations without ever touching or threatening the core scheduling algorithm.

---

## 3. End-to-End Type Safety: Next.js, tRPC, and Zod

For a project processing healthcare compliance (HIPAA), SOC2 requirements, and financial payments, runtime type errors are unacceptable. Our commitment to strict Type-Safety spans the entire stack.

We heavily leverage **tRPC** for our Web application to communicate with our server. By utilizing tRPC, traditional REST serialization vulnerabilities and mismatches vanish; our frontend inherently knows the exact TypeScript return shape of a database query without defining an explicit API spec.

Underpinning tRPC mutations is **Zod**. Every piece of data entering our system—whether hitting our REST API or internal tRPC router—is strictly evaluated against Zod schemas. 

Furthermore, we utilize `zod-prisma-types`. This ensures that if we update a column constraint in our PostgreSQL database schema, the boundary validation layer structurally inherits that change instantaneously.

---

## 4. Modeling Time: The Database Schema

Booking time across multiple human beings is shockingly difficult. You have to intercept timezones, daylight savings, multi-party working hours, and physical calendar conflicts. Our PostgreSQL database is the workhorse here.

To support dynamic **Round-Robin** and **Collective** scheduling organically, we had to model our schema intelligently:
*   `EventType`: Represents the parameters of the meeting (duration, buffers, locations, strict limits like "max 2 per day").
*   `Host` and `HostGroup`: These pivot tables dynamically map multiple physical users to an `EventType`. The tables contain weights and calibration scores that allow the scheduler to actively distribute load among sales reps or support layers in a round-robin format dynamically.
*   `Profile` and `Team`: We architected extreme multi-tenancy. A single `User` account can belong to multiple distinct organizations (`Teams`), seamlessly maintaining distinct organizational aliases, workflows, and branding.

### Kysely for High-Performance Queries
While **Prisma** gives us incredible Developer Experience (DX) for 90% of our CRUD operations, fetching slot availability across large teams with complex filtering bounds can result in N+1 nightmares or inefficient SQL generation. For those highly optimized read paths, we utilize **Kysely** via the `prisma-kysely` integration, allowing us to drop into strictly-typed, brutally efficient raw SQL queries when traversing hierarchical team structures.

---

## 5. Performance at Scale (Redis & Task Queues)

At scale, the booking frontend becomes a very expensive read-heavy application. Calculating availability requires merging a user's static `Schedule` logic with live API polling requests to external calendars (Google, Outlook) to detect conflicting events. Doing this on the fly for every rendering request results in significant latencies.

*   **Caching via Upstash Redis**: We aggressively cache slot queries, availability meshes, and rate-limits. If a user's calendar hasn't fired an update webhook, we serve calculated intersections from memory.
*   **Event-Driven Webhooks**: Booking states are essentially state machines (`PENDING` -> `ACCEPTED` -> `CANCELLED`). We utilize an internal event subscriber queue combined with asynchronous task runners (like Trigger.dev and Cron configurations) to handle heavy lifters out-of-band: firing external webhooks, sending SMS reminders globally (via Twilio), and parsing retries seamlessly without blocking the main event loop.

---

## Final Thoughts

Building Cal.com wasn’t just about writing code that puts events on a calendar. It was about creating an infrastructural architecture capable of stretching from a solo freelancer to enterprise organizations requiring strict HIPAA compliance, all while maintaining an open-source ethos.

Extensibility, rigid type boundaries, and domain isolation allowed us to scale the codebase effortlessly alongside a global ecosystem of contributors. The internet doesn’t need more walled gardens; it needs modular infrastructure. And that’s exactly what the architecture of Cal.com was engineered to be.
