import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { ArticleContent } from "@/lib/article"

const projects: Record<string, { title: string; date: string; tags: string[]; content: string }> = {
  "calcom-architecture": {
    title: "Building Cal.com: The Open-Source Scheduling Infrastructure for the Web",
    date: "2026-04-14",
    tags: ["System Design", "Architecture", "Next.js"],
    content: `When I started building **Cal.com** (formerly Calendso), the mission was simple: scheduling is a universal, infrastructural layer of the internet, and tying it to closed-source, deeply coupled, proprietary walled gardens was fundamentally limiting for developers.

We didn't just want to build an alternative to Calendly; we wanted to build the *Stripe for time*. We needed an open-source scheduling infrastructure that was robust enough for extreme enterprise multi-tenancy, yet modular enough for developers to embed and customize limitlessly.

In this post, I want to take you through the technical journey, the architectural decisions, and the deep system design that powers Cal.com today.

## 1. The Monorepo Foundation (Turborepo)

From day one, I knew Cal.com was going to be more than a single web application. Between our primary booking application, our REST APIs (for headless integrations), embed scripts, and various micro-utilities, a monolithic codebase would eventually become a nightmare to test, deploy, and scale.

We adopted a **Turborepo-powered Monorepo** architecture.

This structural decision enabled massive modularity. We decoupled our core business logic into highly scoped \`packages\` while exposing them via \`apps\`.

\`\`\`typescript title="Monorepo Structure"
apps/
  web/          # Core Next.js app
  api/          # Decoupled REST API
packages/
  prisma/       # DB schema & migrations
  trpc/         # Type-safe API routers
  ui/           # Tailwind design system
  features/     # Domain-driven business logic
  app-store/    # Third-party integrations
\`\`\`

By structuring the codebase this way, we isolated dependencies and maximized cacheable CI/CD pipelines, resulting in incredibly fast developer velocity despite possessing an enterprise-scale codebase.

## 2. Breaking the Monolith: The "App Store" Pattern

One of the largest engineering hurdles in scheduling is the **combinatorial explosion of integrations**. Users don't just want Google Calendar—they want Outlook, CalDAV, Apple Calendar, Zoom, Microsoft Teams, Daily.co, Stripe, and HubSpot.

Hard-codifying these integrations deeply into the core scheduling engine would have resulted in bloated, fragile spaghetti code.

**Our Solution: The App Store Architecture (\`packages/app-store\`).**

We abstracted integrations away from the core scheduler and built an internal plugin system. Each third-party integration is an isolated "App." We rely heavily on the **Open-Closed Principle (OCP)**.

When a user creates a booking, our core engine triggers an asynchronous *Video/Calendar Creation Pipeline*. The platform checks the \`Credential\` table, polymorphically figures out which APIs the user has enabled, and dynamically hydrates the respective classes instance (e.g., \`GoogleCalendarService\`). The core system doesn't need to know *how* Google Calendar creates an event, it only cares that the app returns an object matching our \`CalendarEventResponse\` interface.

This decoupling allowed our open-source contributors to build out dozens of integrations without ever touching or threatening the core scheduling algorithm.

## 3. End-to-End Type Safety: Next.js, tRPC, and Zod

For a project processing healthcare compliance (HIPAA), SOC2 requirements, and financial payments, runtime type errors are unacceptable. Our commitment to strict Type-Safety spans the entire stack.

We heavily leverage **tRPC** for our Web application to communicate with our server. By utilizing tRPC, traditional REST serialization vulnerabilities and mismatches vanish; our frontend inherently knows the exact TypeScript return shape of a database query without defining an explicit API spec.

\`\`\`typescript title="tRPC Router Example"
const bookingRouter = router({
  getByDay: protectedProcedure
    .input(z.object({ date: z.date(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.booking.findMany({
        where: { date: input.date, userId: input.userId },
      })
    }),
})
\`\`\`

Underpinning tRPC mutations is **Zod**. Every piece of data entering our system—whether hitting our REST API or internal tRPC router—is strictly evaluated against Zod schemas.

## 4. Modeling Time: The Database Schema

Booking time across multiple human beings is shockingly difficult. You have to intercept timezones, daylight savings, multi-party working hours, and physical calendar conflicts. Our PostgreSQL database is the workhorse here.

To support dynamic **Round-Robin** and **Collective** scheduling organically, we had to model our schema intelligently:

- \`EventType\`: Represents the parameters of the meeting (duration, buffers, locations, strict limits like "max 2 per day").
- \`Host\` and \`HostGroup\`: These pivot tables dynamically map multiple physical users to an \`EventType\`.
- \`Profile\` and \`Team\`: We architected extreme multi-tenancy. A single \`User\` account can belong to multiple distinct organizations (\`Teams\`), seamlessly maintaining distinct organizational aliases, workflows, and branding.

### Kysely for High-Performance Queries

While **Prisma** gives us incredible Developer Experience (DX) for 90% of our CRUD operations, fetching slot availability across large teams with complex filtering bounds can result in N+1 nightmares or inefficient SQL generation. For those highly optimized read paths, we utilize **Kysely** via the \`prisma-kysely\` integration.

## 5. Performance at Scale (Redis & Task Queues)

At scale, the booking frontend becomes a very expensive read-heavy application. Calculating availability requires merging a user's static \`Schedule\` logic with live API polling requests to external calendars (Google, Outlook) to detect conflicting events.

- **Caching via Upstash Redis**: We aggressively cache slot queries, availability meshes, and rate-limits.
- **Event-Driven Webhooks**: Booking states are essentially state machines (\`PENDING\` -> \`ACCEPTED\` -> \`CANCELLED\`). We utilize an internal event subscriber queue combined with asynchronous task runners to handle heavy lifters out-of-band.

## Final Thoughts

Building Cal.com wasn't just about writing code that puts events on a calendar. It was about creating an infrastructural architecture capable of stretching from a solo freelancer to enterprise organizations requiring strict HIPAA compliance, all while maintaining an open-source ethos.

Extensibility, rigid type boundaries, and domain isolation allowed us to scale the codebase effortlessly alongside a global ecosystem of contributors. The internet doesn't need more walled gardens; it needs modular infrastructure. And that's exactly what the architecture of Cal.com was engineered to be.`,
  },
  "llm-wiki-architecture": {
    title: "Beyond RAG: Engineering a Compounding LLM Knowledge Graph",
    date: "2026-04-14",
    tags: ["LLMs", "RAG", "Knowledge Graphs"],
    content: `When working with Large Language Models, the industry consensus for personal knowledge management has heavily tilted toward Retrieval-Augmented Generation (RAG). But after building multiple RAG pipelines, I realized a fundamental flaw in the architecture: **RAG does not compound.**

In a standard RAG system, every time you ask a question, the AI retrieves raw documents, reads them from scratch, and derives an answer. It never remembers the synthesis. It never connects ideas across documents natively. If two documents contradict each other, RAG silently ignores the conflict or hallucinates a middle ground.

Inspired by Andrej Karpathy's LLM Wiki concept, I decided to build **LLM Wiki**: a system where an autonomous AI agent incrementally builds and maintains a persistent, interlinked markdown wiki.

Here is a deep dive into how I architected a system that replaces ephemeral embeddings with a permanent, compounding knowledge graph.

## 1. The Core Architecture: Human in Obsidian, AI in Markdown

The beauty of the LLM Wiki lies in its simplicity. There are no vector databases, no complex reranking algorithms, and no opaque embedding models.

The entire stack is built on the file system:

- **The Interface**: Obsidian, providing a beautiful graph view, wikilink support, and local markdown rendering.
- **The Intelligence**: OpenCode acting as the autonomous AI agent.
- **The Director**: \`wiki.py\`, a deterministic Python maintenance script that handles the structural bookkeeping.

### Directory Structure

We strictly separate the raw data from the synthesized knowledge to maintain system integrity:

\`\`\`text title="LLM Wiki Directory Structure"
obsidian/
├── raw/           # Immutable source documents
└── wiki/          # AI-maintained knowledge pages
    ├── index.md        # Content catalog
    ├── sources/        # Short routers/summaries of raw docs
    ├── entities/       # Extracted people, tools, organizations
    └── comparisons/    # Cross-cutting analyses
\`\`\`

## 2. Ingestion: Engineering the Compounding Effect

The fundamental difference between this and RAG happens during the \`/ingest\` phase.

When I drop a new PDF or markdown file into \`obsidian/raw/\` and trigger the ingest command, the agent reads the source **exactly once**. It doesn't just summarize it; it synthesizes it into the global graph.

1. **Immutability**: The raw file is never edited. It remains the source of truth.
2. **Entity & Concept Extraction**: The agent identifies novel concepts or entities (e.g., "Docker", "Event Loop") and creates dedicated structural pages. Crucially, it applies *significance filtering* so the wiki doesn't bloat with generic terms.
3. **Cross-Referencing**: It connects new pages to existing ones using \`[[wikilinks]]\`.
4. **Handling Contradictions**: If a new source contradicts an existing concept page, the system does not silently overwrite. It uses Obsidian callouts to flag both claims, preserving intellectual honesty and deferring to the human.

When I ask a question three months later via \`/query\`, the AI reads the concise, pre-synthesized concept pages, rather than parsing 50 raw PDFs from scratch. It gets smarter and significantly cheaper on token usage over time.

## 3. Automation vs. Agentic Drift: Enter \`wiki.py\`

Early iterations revealed a critical flaw with relying entirely on LLMs for system maintenance: **Agentic Drift**. LLMs are brilliant synthesizers but terrible at deterministic bookkeeping. They forget to update YAML frontmatter, mess up ISO timestamps, or inadvertently break markdown schemas.

To solve this, I architected \`wiki.py\` as a strict, mechanical boundary.

\`\`\`python title="wiki.py CLI Interface"
# Generate a new knowledge page
$ wiki.py new entity docker

# Append an activity log entry
$ wiki.py log "Ingested kubernetes-cheatsheet.md"

# Add a new entry to the index
$ wiki.py index add entities/docker.md
\`\`\`

Instead of asking the LLM to format the \`index.md\` or compute file hashes, the agent is equipped with a toolset calling \`wiki.py\` explicitly:

- \`wiki.py new <type> <slug>\`: Generates a perfectly formatted YAML header.
- \`wiki.py log\`: Appends chronological, grep-able activity logs.
- \`wiki.py index add\`: Deterministically interpolates new entries into the index structure.

By offloading the "chores" to Python, the LLM utilizes 100% of its context window on *understanding the material*.

## 4. Git-Powered Incremental Updates & SHA-256 Hashing

One of the hardest problems in knowledge management is tracking mutated sources. If I update a cheat sheet in \`obsidian/raw/\`, how does the agent know it needs to re-ingest?

I avoided building a complex database layer and instead leveraged the file system and Git.

\`\`\`python title="SHA-256 Hash Tracking"
import hashlib

def compute_hash(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

# Stored in YAML frontmatter after ingestion
# hash: sha256:a1b2c3d4e5f6...
\`\`\`

1. **SHA-256 Frontmatter Tracking**: During ingestion, \`wiki.py\` computes a SHA-256 hash of the raw file and stores it in the generated source page's YAML frontmatter.
2. **Git Diffing**: The repository auto-commits after every successful ingest. If a file is modified later, \`wiki.py pending\` checks the live hash against the ingested hash.
3. **Token-Efficient Re-Reads**: Because the wiki tracks changes natively via \`git\`, the AI agent uses \`git diff\` to ingest *only* the modified lines of a raw file, drastically reducing context exhaustion.

## 5. Overcoming the LLM Context Limit

To prevent context window explosion when processing dense knowledge repositories, I implemented a robust batching system.

When calculating the delta between the raw documents and the wiki, \`wiki.py status\` chunks pending files into batches of 5. The OpenCode agent systematically processes these batches in parallel sub-agent workflows, aggressively minimizing prompt bloat and avoiding infinite instruction loops.

## Final Thoughts

The LLM Wiki fundamentally changes the relationship between humans and their data.

With standard RAG, the database is a black box of embeddings only the machine understands. With this architecture, the database is a strictly organized, human-readable markdown graph that you can browse, edit, and explore asynchronously.

By pushing the LLM to act as an asynchronous *librarian* rather than a real-time *calculator*, we unlock a knowledge system that natively scales, interconnects, and genuinely compounds.`,
  },
  "portfolio-v3": {
    title: "Portfolio v3: This Website",
    date: "2026-04-14",
    tags: ["React", "Vite", "shadcn/ui"],
    content: `The portfolio you're looking at right now is version 3 of my personal site — a conversion-focused landing page engineered with Vite, React, and shadcn/ui.

The goal was simple: minimal noise, maximum signal. A single-page layout that communicates who I am, what I've built, and what I think — within seconds of landing.

## Architecture & Design Decisions

### Monorepo-Free Simplicity

For a personal site, a Turborepo setup would be overkill. I went with a straightforward Vite + React + TypeScript stack. The build is fast, the config is minimal, and deploying to GitHub Pages via a GitHub Actions workflow takes seconds.

### Design System: shadcn/ui

Rather than building primitives from scratch, I leveraged shadcn/ui — a collection of accessible, composable React components built on Radix UI and styled with Tailwind CSS v4. The key advantage: I own the code. Every component lives in my source tree, fully customizable.

The component philosophy here is **restraint**. No decorative animations. No glowing gradients. Just clean typography, generous whitespace, and intentional hover states.

### Glassmorphism on Hover

The project cards use a dark glassmorphism effect on hover — a translucent dark background with white text contrast and a soft drop shadow. This creates a visual "pop" that draws the eye without resorting to heavy color shifts.

### Typography: Urbanist + Monofur Nerd Font Mono

- **Headings & body**: Urbanist Variable (via Fontsource) — geometric, modern, excellent at display sizes.
- **Code blocks**: Monofur Nerd Font Mono — a distinctive programming font with excellent readability in code snippets.

### Syntax Highlighting: Shiki

Blog and project writeups use Shiki with dual themes (github-light-default / github-dark-default) so code blocks look correct in both light and dark mode, with CSS variable switching based on the active theme class.

### Deploying to GitHub Pages

The site deploys as a static SPA to GitHub Pages at sharma0x.github.io. A single GitHub Actions workflow handles:

- **Build**: \`tsc -b && vite build\`
- **Deploy**: Upload the artifact and deploy via \`actions/deploy-pages@v4\`
- A \`.nojekyll\` file in \`public/\` prevents Jekyll processing

## What's Not Here

No contact form, no analytics, no cookie banner. This is a portfolio, not a SaaS. If you want to reach me, the links are right there.

## Final Thoughts

A portfolio site should be a snapshot of how you think — not just what you've done. V3 embodies that philosophy: opinionated tooling choices, intentional typography, and nothing that doesn't need to be here.`,
  },
}

export function ProjectPost() {
  const { slug } = useParams<{ slug: string }>()
  const project = projects[slug || ""]

  if (!project) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="mt-2 text-muted-foreground">The project you're looking for doesn't exist.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-svh animate-fade-in">
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
            {project.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(project.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-p:leading-relaxed
          prose-a:text-foreground prose-a:no-underline hover:prose-a:underline
          prose-strong:font-semibold
          prose-hr:border-border/40
        ">
          <ArticleContent content={project.content} />
        </div>
      </div>
    </article>
  )
}