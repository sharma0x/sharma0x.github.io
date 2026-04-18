# GitHub Pages Deployment Issue

## Problem

- Build succeeds locally with `pnpm dev` and `pnpm preview`
- GitHub Pages deploys but shows blank white screen
- Browser console error:

```
Failed to load module script: Expected a JavaScript-or-Wasp module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

## What Works

- `pnpm dev` → http://localhost:5173 works
- `pnpm build` → produces valid dist/ with JS/CSS files
- `pnpm preview` → serves correctly locally

## CI Workflow

- Uses `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`
- Node 24 + pnpm v10
- dist/ folder is uploaded as artifact

## Suspected Cause

MIME type not set correctly for `.js` files when served via GitHub Pages artifact method.

## Attempted Fixes

- Updated page title in index.html
- Ensured `.nojekyll` exists in public/
- Verified dist/ output is correct