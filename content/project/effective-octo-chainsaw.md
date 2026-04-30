---
title: "Manim Video Generator"
subtitle: "Browser-Based Mathematical Animation Renderer"
description: "A full-stack platform for writing Manim Python code in a Monaco Editor and rendering mathematical animations in real-time via sandboxed Docker containers with AST-based security validation."
date: "2026-04-26"
tags:
  - Python
  - FastAPI
  - Next.js
  - Docker
  - WebSocket
github: "https://github.com/sharma0x/effective-octo-chainsaw"
---

**Manim Video Generator** is a browser-based code editor and real-time renderer for [Manim](https://www.manim.community/) — the animation engine behind 3Blue1Brown. It bridges the gap between writing mathematical Python code and watching it come to life, all within a single web interface.

## The Problem

Manim is incredibly powerful for creating explanatory math videos, but the workflow is fragmented. Users write Python scripts locally, wait for renders to complete with no visibility into progress, and have no easy way to share or iterate on scenes collaboratively. I wanted to build a seamless, web-native experience where writing and rendering happen side-by-side.

## Architecture Overview

The project is structured as a modern full-stack application with clear separation between frontend, backend, and infrastructure concerns:

```text title="Project Structure"
clients/                     # Frontend monorepo (pnpm + Turborepo)
├── apps/web/                # Next.js web app
└── packages/
    ├── ui/                  # Shared UI components
    ├── client/              # API client + types
    ├── typescript-config/   # Shared tsconfig presets
    └── eslint-config/       # Shared ESLint configs
server/                      # Python/FastAPI backend
└── manim_renderer/          # Domain-driven Python package
    ├── render/              # Rendering orchestration
    ├── scene/               # Scene detection + AST validation
    ├── job/                 # Job lifecycle management
    ├── websocket/           # Real-time progress streaming
    └── cleanup/             # Output lifecycle management
```

## Frontend: Monaco + Next.js

The web interface is built as a Next.js application inside a Turborepo-powered frontend monorepo. The editing experience centers on a **Monaco Editor** instance with Python syntax highlighting and auto-detection of Scene classes.

Key frontend decisions:
- **Turborepo** for managing shared packages (UI components, API client, TypeScript configs) across the monorepo
- **Monaco Editor** for a VS Code-like editing experience with IntelliSense
- **Real-time WebSocket integration** for live frame counters and render progress
- **React-based UI** with Tailwind CSS for a clean, distraction-free interface

## Backend: FastAPI with Domain-Driven Design

The backend is built with **FastAPI** and follows a strict domain-driven module pattern. Each domain (`render`, `scene`, `job`, `websocket`, `auth`) is self-contained with its own endpoints, service layer, and repository layer.

### AST-Based Code Validation

Security is critical when accepting arbitrary Python code from users. Before any code reaches the Docker sandbox, it passes through an **AST-based validation pipeline**:

- Parses the submitted code into an Abstract Syntax Tree
- Rejects unsafe imports (`os`, `sys`, `subprocess`, etc.)
- Blocks dangerous built-in functions (`eval`, `exec`, `open`, etc.)
- Validates that the code contains valid Manim Scene classes

This ensures that only intended Manim code executes inside the sandbox.

### Sandboxed Docker Execution

Rendering happens inside **sandboxed Docker containers** with aggressive security constraints:

- **No network access** inside the container
- **Read-only filesystem** except for the output directory
- **Resource limits** on CPU and memory
- **Dropped Linux capabilities** to minimize attack surface
- **Concurrent queue management** with cancellation support

### Real-Time Progress Streaming

Users don't wait blindly for renders. A **WebSocket connection** streams live progress updates including:

- Current frame number and total frames
- Render phase transitions (compilation → animation → encoding)
- Error messages if rendering fails
- Final video URL when complete

## Infrastructure

The project uses Docker Compose for both development and production:

- **PostgreSQL** for job persistence and user data
- **Redis** for caching and queue state
- **MinIO** for object storage of rendered videos
- **Docker-in-Docker** for secure render container orchestration

## Key Commands

The entire project is orchestrated through a **Makefile**:

```bash
make setup    # First-time environment setup
make dev      # Start all dev services (server + client + infra)
make test     # Run full test suite
make lint     # Lint all Python + TypeScript code
make docker-up  # Start production containers
```

## Final Thoughts

Building the Manim Video Generator reinforced a principle I hold deeply: **developer experience is infrastructure**. The AST validator, the Docker sandbox, the WebSocket stream — these aren't features users see directly, but they are what make the product usable and trustworthy.

Mathematics deserves beautiful explanations. This project makes creating them accessible from any browser.
