---
title: "Agentic Video Generator"
subtitle: "Story-to-Animation Studio with Manim & Remotion"
description: "An agentic video authoring platform where a ReAct coding agent writes, executes, and self-corrects Manim and Remotion code in sandboxed Docker containers, turning a plain-language script into a narrated, rendered video."
date: "2026-07-11"
tags:
  - Python
  - FastAPI
  - LangGraph
  - DSPy
  - Docker
  - Next.js
github: "https://github.com/sharma0x/effective-octo-chainsaw"
---

The **Agentic Video Generator** is a browser-based studio for producing explainer videos without leaving the browser. You write a script, an AI agent turns each paragraph into a working animation, checks that it actually renders, and fixes its own mistakes — while you watch the result on a timeline.

It started as a Manim code editor with a live renderer. It is now a story-first platform: script → chunks → animation code → render → narration, with an agent in the middle that closes the loop on verification.

## The Problem

Manim and Remotion are powerful, but both have a brutal authoring loop: write code locally, run a multi-minute render, and read a traceback when it fails. Nothing tells you *which scene* is broken, and there is no feedback loop between the animation and the narration that explains it.

I wanted a system where the feedback loop is the product — where the agent renders the scene, reads the real error, and repairs the code before handing anything back.

## Architecture Overview

A FastAPI backend with a strict domain-module pattern (each domain owns its endpoints, schemas, service, and repository) behind a Turborepo-powered frontend monorepo:

```text title="Project Structure"
clients/                     # Frontend monorepo (pnpm + Turborepo)
├── apps/web/                # Next.js web app
└── packages/
    ├── ui/                  # Shared UI components
    ├── client/              # API client + types
    ├── typescript-config/   # Shared tsconfig presets
    └── eslint-config/       # Shared ESLint configs
server/                      # Python/FastAPI backend
└── video_generator/          # Domain-driven Python package
    ├── ai/                  # ReAct agent, tools, sandbox, memory
    ├── story/               # Script chunking (DSPy)
    ├── render_engine/       # Pluggable Manim / Remotion engines
    ├── worker/              # Warm container worker pool
    ├── lsp/                 # basedpyright diagnostics
    ├── audio/               # Kokoro TTS + sentence sync
    ├── frame/               # Scene records
    └── websocket/           # Real-time progress streaming
```

## The Agent: Write → Render → Fix

The core of the system is a **LangGraph ReAct agent** (`create_react_agent`) with 16 tools bound to a per-frame Docker sandbox:

- **File operations** — `read_file`, `write_file`, `patch_file`, `delete_file`, `grep_files`, `search_files`
- **Execution** — `run_command`, `execute_python_script`, `execute_python_code`
- **Background processes** — start, list, kill, and read logs from long-running jobs
- **Verification** — `check_render_errors`, `check_lsp_diagnostics`, `read_traceback`
- **Self-improvement** — `record_learned_rule`

The system prompt makes verification non-optional: the agent **cannot end its turn until `check_render_errors` returns success**. When a render fails, the raw traceback is regex-parsed into structured diagnostics and fed back as the next observation.

Every lesson learned is written to `manim-code-learnings.json` with near-duplicate filtering (`difflib` ratio > 0.5) and injected back into the system prompt on subsequent runs. The agent genuinely gets better at the codebase it is working in.

## Sandbox: Docker as a Security Boundary

Agent-generated code is untrusted by definition, so every tool call executes inside a container with:

- Bind-mounted per-frame sandbox directory with `_secure_path` blocking absolute paths and `..` traversal
- AST validation before execution — unsafe imports (`os`, `sys`, `subprocess`) and dangerous builtins (`eval`, `exec`, `open`) are rejected
- Dropped Linux capabilities, `no-new-privileges`, memory and CPU limits
- Dependencies baked into the image rather than installed per run

## Render Engines: One Abstraction, Two Backends

Rendering goes through a `RenderingEngine` ABC registered in an `EngineRegistry`. Both backends share one sandboxed execution path, parameterized by a `Skill` dataclass:

| Engine | Entry point | Output |
|--------|-------------|--------|
| Manim (Python) | `main.py` | `manim -q{quality} --media_dir . main.py SceneName` |
| Remotion (React) | `index.tsx` | `@remotion/bundler` + `renderMedia({codec: 'h264'})` |

A **warm worker pool** keeps Manim containers alive between jobs so renders skip the LaTeX cold start. When no worker is available or a job times out, the orchestrator falls back to a one-shot container.

Renders are **content-addressed**: the sorted set of files plus scene name and quality is hashed into a cache key, so duplicate submissions — including concurrent ones — collapse into a single job.

## Story-First Authoring

The interesting entry point is not the code editor, it is the script.

1. **Script** — a single source of truth for the narration.
2. **Chunking** — a DSPy signature proposes scene boundaries with an `animation_description` for each; the model output is then deterministically repaired so coverage is contiguous and lossless.
3. **Frames** — a chunk *is* a frame. Inserting or deleting text in the script re-anchors every `script_start_index` / `script_end_index`.
4. **Narration** — Kokoro TTS synthesizes each sentence separately, so every `ScriptSentence` records its own character offsets and audio start/end times in milliseconds. Highlight a sentence in the player and it speaks.
5. **Render** — each frame generates, renders, and caches independently, with progress streamed over WebSocket.

## Developer Experience as Infrastructure

Three pieces exist purely to make the agent trustworthy:

- **basedpyright LSP** — a hand-rolled JSON-RPC stdio client surfaces real type errors into Monaco as `setModelMarkers`, with a content-hash cache and an `ast.parse` fallback when the subprocess is unavailable.
- **Langfuse** — traces every agent run, tool call, and render, then scores the trace with `render-success` and a `render-error-type` label so regressions are visible.
- **Eval harness** — DSPy `BootstrapFewShot` compiles the generation prompt against a golden dataset; promptfoo runs regression assertions across providers and models.

## Engineering Decisions Worth Calling Out

- **SQLModel over raw SQLAlchemy** (ADR-0001) — one definition for the ORM model and the Pydantic schema.
- **Domain modules over layers** (ADR-0002) — features own their endpoints, service, and repository instead of scattering across `controllers/services/repositories`.
- **Diagnostics and code stripping on the server** (ADR-0003) — running basedpyright in the backend keeps the browser free of a second language server.

## Final Thoughts

The lesson I keep relearning: an autonomous agent is only as good as the verification loop around it. Rendering the code, reading the actual traceback, and refusing to stop until it passes is what turns a demo into a tool.

Writing code is the part that was always easy. Making it verifiable is the engineering.