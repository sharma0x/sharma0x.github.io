---
title: "LLM Wiki"
subtitle: "Compounding Knowledge Graph"
description: "An autonomous AI-maintained personal knowledge base that replaces traditional RAG with a persistent, interlinked markdown wiki. Built with Python, Obsidian, and SHA-256 incremental tracking."
date: "2026-04-14"
tags:
  - LLMs
  - RAG
  - Automation
github: "https://github.com/sharma0x"
---

When working with Large Language Models, the industry consensus for personal knowledge management has heavily tilted toward Retrieval-Augmented Generation (RAG). But after building multiple RAG pipelines, I realized a fundamental flaw in the architecture: **RAG does not compound.**

In a standard RAG system, every time you ask a question, the AI retrieves raw documents, reads them from scratch, and derives an answer. It never remembers the synthesis. It never connects ideas across documents natively. If two documents contradict each other, RAG silently ignores the conflict or hallucinates a middle ground.

Inspired by Andrej Karpathy's LLM Wiki concept, I decided to build **LLM Wiki**: a system where an autonomous AI agent incrementally builds and maintains a persistent, interlinked markdown wiki.

Here is a deep dive into how I architected a system that replaces ephemeral embeddings with a permanent, compounding knowledge graph.

## 1. The Core Architecture: Human in Obsidian, AI in Markdown

The beauty of the LLM Wiki lies in its simplicity. There are no vector databases, no complex reranking algorithms, and no opaque embedding models.

The entire stack is built on the file system:

- **The Interface**: Obsidian, providing a beautiful graph view, wikilink support, and local markdown rendering.
- **The Intelligence**: OpenCode acting as the autonomous AI agent.
- **The Director**: `wiki.py`, a deterministic Python maintenance script that handles the structural bookkeeping.

### Directory Structure

We strictly separate the raw data from the synthesized knowledge to maintain system integrity:

```text title="LLM Wiki Directory Structure"
obsidian/
├── raw/           # Immutable source documents
└── wiki/          # AI-maintained knowledge pages
    ├── index.md        # Content catalog
    ├── sources/        # Short routers/summaries of raw docs
    ├── entities/       # Extracted people, tools, organizations
    └── comparisons/    # Cross-cutting analyses
```

## 2. Ingestion: Engineering the Compounding Effect

The fundamental difference between this and RAG happens during the `/ingest` phase.

When I drop a new PDF or markdown file into `obsidian/raw/` and trigger the ingest command, the agent reads the source **exactly once**. It doesn't just summarize it; it synthesizes it into the global graph.

1. **Immutability**: The raw file is never edited. It remains the source of truth.
2. **Entity & Concept Extraction**: The agent identifies novel concepts or entities (e.g., "Docker", "Event Loop") and creates dedicated structural pages. Crucially, it applies *significance filtering* so the wiki doesn't bloat with generic terms.
3. **Cross-Referencing**: It connects new pages to existing ones using `[[wikilinks]]`.
4. **Handling Contradictions**: If a new source contradicts an existing concept page, the system does not silently overwrite. It uses Obsidian callouts to flag both claims, preserving intellectual honesty and deferring to the human.

When I ask a question three months later via `/query`, the AI reads the concise, pre-synthesized concept pages, rather than parsing 50 raw PDFs from scratch. It gets smarter and significantly cheaper on token usage over time.

## 3. Automation vs. Agentic Drift: Enter `wiki.py`

Early iterations revealed a critical flaw with relying entirely on LLMs for system maintenance: **Agentic Drift**. LLMs are brilliant synthesizers but terrible at deterministic bookkeeping. They forget to update YAML frontmatter, mess up ISO timestamps, or inadvertently break markdown schemas.

To solve this, I architected `wiki.py` as a strict, mechanical boundary.

```python title="wiki.py CLI Interface"
# Generate a new knowledge page
$ wiki.py new entity docker

# Append an activity log entry
$ wiki.py log "Ingested kubernetes-cheatsheet.md"

# Add a new entry to the index
$ wiki.py index add entities/docker.md
```

Instead of asking the LLM to format the `index.md` or compute file hashes, the agent is equipped with a toolset calling `wiki.py` explicitly:

- `wiki.py new <type> <slug>`: Generates a perfectly formatted YAML header.
- `wiki.py log`: Appends chronological, grep-able activity logs.
- `wiki.py index add`: Deterministically interpolates new entries into the index structure.

By offloading the "chores" to Python, the LLM utilizes 100% of its context window on *understanding the material*.

## 4. Git-Powered Incremental Updates & SHA-256 Hashing

One of the hardest problems in knowledge management is tracking mutated sources. If I update a cheat sheet in `obsidian/raw/`, how does the agent know it needs to re-ingest?

I avoided building a complex database layer and instead leveraged the file system and Git.

```python title="SHA-256 Hash Tracking"
import hashlib

def compute_hash(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

# Stored in YAML frontmatter after ingestion
# hash: sha256:a1b2c3d4e5f6...
```

1. **SHA-256 Frontmatter Tracking**: During ingestion, `wiki.py` computes a SHA-256 hash of the raw file and stores it in the generated source page's YAML frontmatter.
2. **Git Diffing**: The repository auto-commits after every successful ingest. If a file is modified later, `wiki.py pending` checks the live hash against the ingested hash.
3. **Token-Efficient Re-Reads**: Because the wiki tracks changes natively via `git`, the AI agent uses `git diff` to ingest *only* the modified lines of a raw file, drastically reducing context exhaustion.

## 5. Overcoming the LLM Context Limit

To prevent context window explosion when processing dense knowledge repositories, I implemented a robust batching system.

When calculating the delta between the raw documents and the wiki, `wiki.py status` chunks pending files into batches of 5. The OpenCode agent systematically processes these batches in parallel sub-agent workflows, aggressively minimizing prompt bloat and avoiding infinite instruction loops.

## Final Thoughts

The LLM Wiki fundamentally changes the relationship between humans and their data.

With standard RAG, the database is a black box of embeddings only the machine understands. With this architecture, the database is a strictly organized, human-readable markdown graph that you can browse, edit, and explore asynchronously.

By pushing the LLM to act as an asynchronous *librarian* rather than a real-time *calculator*, we unlock a knowledge system that natively scales, interconnects, and genuinely compounds.