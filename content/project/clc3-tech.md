---
title: "CLC3.tech"
subtitle: "Unified Competitive Programming Leaderboard"
description: "A full-stack platform that unifies and constantly updates user performance data from Codeforces, LeetCode, and CodeChef into a single, comprehensive social leaderboard."
date: "2024-01-15"
tags:
  - Next.js
  - TypeScript
  - Python
  - Docker
  - AWS EC2
github: "https://github.com/princesharma74/giggle-nextjs-clc3"
---

**CLC3.tech** is a full-stack competitive programming analytics platform I built to solve a personal frustration: tracking progress across multiple coding platforms is a fragmented, manual process. Codeforces, LeetCode, and CodeChef each have their own rating systems, profile pages, and APIs. There was no single place to see how you — or your friends — were performing across all three.

So I built one.

## The Problem

Competitive programmers juggle multiple platforms. Each has its own rating, contest history, and submission stats. Comparing progress across platforms meant opening three tabs, manually correlating data, and keeping mental models of relative difficulty. There was no unified social layer for competitive programming.

CLC3.tech solves this by pulling live data from all three platforms, normalizing it, and presenting it in a single, shareable profile with a social leaderboard.

## Architecture

The platform is built as a modern full-stack application with a clear separation between data ingestion, storage, and presentation:

```text title="Architecture Overview"
Frontend (Next.js 14)
├── Server Components for data fetching
├── Client Components for interactivity
└── Tailwind CSS for styling

Backend (Python)
├── Platform scrapers (Codeforces, LeetCode, CodeChef)
├── REST API for data aggregation
└── Scheduled jobs for live updates

Infrastructure
├── AWS EC2 for hosting
├── Docker for containerization
├── MySQL for relational data
└── GitHub Actions for CI/CD
```

## Platform Integrations

The core challenge was reliably fetching data from three very different platforms:

- **Codeforces**: Official API with rate limits. Handled pagination for large submission histories.
- **LeetCode**: No official API, so I built a robust GraphQL client against their internal endpoints with retry logic and backoff.
- **CodeChef**: Scraped via their public profile pages with careful caching to avoid being rate-limited.

Each integration normalizes platform-specific data (ratings, contest ranks, submission counts) into a unified schema so profiles are directly comparable.

## Real-Time Updates

User data isn't static. Ratings change after every contest, submissions happen daily. The backend runs scheduled cron jobs that:

1. Poll all three platforms for updated stats
2. Compute deltas (rating changes, new submissions, contest participation)
3. Update the database with fresh data
4. Invalidate frontend caches so profiles reflect the latest state

This means when you visit a profile, you're seeing data that's at most a few hours old — not a manual snapshot from weeks ago.

## Social Leaderboard

Beyond individual profiles, CLC3.tech features a social leaderboard where users can:

- Compare ratings across all three platforms side-by-side
- See trending performers (biggest rating gains in the last week)
- Filter by platform, time range, and rating bracket
- Share their unified profile link with a single URL

The leaderboard is computed via efficient SQL aggregations and cached with stale-while-revalidate semantics to handle traffic spikes.

## DevOps & Deployment

The entire stack is containerized with Docker and deployed on AWS EC2:

- **GitHub Actions** handles CI/CD: lint, test, build Docker image, deploy to EC2
- **Docker Compose** orchestrates the Next.js frontend, Python API, and MySQL database
- **Nginx** reverse-proxies requests and handles SSL termination
- **PM2** manages the Node.js process in production

## What I Learned

Building CLC3.tech taught me a lot about building reliable data pipelines against unreliable third-party APIs. Each platform has its own quirks, rate limits, and undocumented behaviors. Writing resilient scrapers with exponential backoff, proper error handling, and graceful degradation was a deep exercise in defensive programming.

It also reinforced the value of dogfooding: I built this because I needed it. Using it daily meant I felt every bug, every slow query, and every missing feature personally. That tight feedback loop produced a product that actually solves a real problem.
