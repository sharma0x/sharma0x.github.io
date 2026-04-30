# Portfolio Website

Build with Vite + React + shadcn/ui. Deploys static site to GitHub Pages at sharma0x.github.io.

## Commands

```bash
pnpm dev      # start dev server
pnpm build    # build for production (tsc -b && vite build)
pnpm preview  # preview production build
pnpm lint     # run eslint
pnpm typecheck # run tsc --noEmit
pnpm format   # prettier write
```

## shadcn/ui

Use `pnpm dlx` not `npx`:
```bash
pnpm dlx shadcn@latest add button card
```

## Build Config

- Vite base: `/` (for GitHub Pages at root)
- Uses `@` path alias → `./src`
- Tailwind v4 with `@tailwindcss/vite` plugin

## CI/CD

- Node 24 + pnpm v10
- Push to `main` triggers deploy to GitHub Pages
- Uses `actions/upload-pages-artifact` and `actions/deploy-pages@v4`

## Resume

- Source data: `resume_data.json` — single source of truth for all resume content
- After updating `resume_data.json` (projects, experience, skills, etc.), **always regenerate resume assets**:
  ```bash
  python3 scripts/build-resume.py
  ```
- This generates:
  - `public/prince-sharma-resume/index.html` — HTML resume page
  - `public/prince-sharma-resume.pdf` — PDF resume
- Resume generator uses Jinja2 templates in `resume-generator/templates/` with Playwright for PDF rendering

## Gotchas

- Uses `pnpm-lock.yaml`, not `bun.lock` or `yarn.lock`
- GitHub Pages build runs as SPA - no server-side routing
- `.nojekyll` file in `public/` prevents Jekyll processing