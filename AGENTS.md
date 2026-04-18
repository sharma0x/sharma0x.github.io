# AGENTS.md

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

## Gotchas

- Uses `pnpm-lock.yaml`, not `bun.lock` or `yarn.lock`
- GitHub Pages build runs as SPA - no server-side routing
- `.nojekyll` file in `public/` prevents Jekyll processing