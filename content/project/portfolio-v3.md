---
title: "Portfolio v3"
subtitle: "This Website"
description: "A conversion-focused landing page engineered with Vite, React, and shadcn/ui. Minimalist design with a focus on typography and responsive micro-interactions."
date: "2026-04-14"
tags:
  - React
  - Vite
  - shadcn/ui
github: "https://github.com/sharma0x/sharma0x.github.io"
---

The portfolio you're looking at right now is version 3 of my personal site — a conversion-focused landing page engineered with Vite, React, and shadcn/ui.

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

- **Build**: `tsc -b && vite build`
- **Deploy**: Upload the artifact and deploy via `actions/deploy-pages@v4`
- A `.nojekyll` file in `public/` prevents Jekyll processing

## What's Not Here

No contact form, no analytics, no cookie banner. This is a portfolio, not a SaaS. If you want to reach me, the links are right there.

## Final Thoughts

A portfolio site should be a snapshot of how you think — not just what you've done. V3 embodies that philosophy: opinionated tooling choices, intentional typography, and nothing that doesn't need to be here.