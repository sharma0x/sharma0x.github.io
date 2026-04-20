import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { contentPlugin, getBlogs, getProjects } from "./vite-plugin-content"

const SITE_URL = "https://sharma0x.github.io"
const SITE_NAME = "sharma0x"
const SITE_DESCRIPTION = "Software engineer specializing in system design, developer tooling, and infrastructure."

type RouteMeta = { path: string; title: string; description: string }

function buildRouteMeta(): RouteMeta[] {
  const blogs = getBlogs()
  const projects = getProjects()
  return [
    {
      path: "/",
      title: `${SITE_NAME} — Software Engineer`,
      description: SITE_DESCRIPTION,
    },
    ...blogs.map((b) => ({
      path: `/blog/${b.slug}`,
      title: `${b.frontmatter.title} — ${SITE_NAME}`,
      description: b.frontmatter.description,
    })),
    ...projects.map((p) => ({
      path: `/project/${p.slug}`,
      title: `${p.frontmatter.title} — ${SITE_NAME}`,
      description: p.frontmatter.description,
    })),
  ]
}

function buildMetaTags(meta: RouteMeta): string {
  const url = `${SITE_URL}${meta.path}`
  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${meta.title}" />`,
    `<meta property="og:description" content="${meta.description}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${meta.title}" />`,
    `<meta name="twitter:description" content="${meta.description}" />`,
  ].join("\n    ")
}

function injectMeta(html: string, meta: RouteMeta): string {
  const metaTags = buildMetaTags(meta)
  return html
    .replace(/<title>.*?<\/title>/, "")
    .replace(/<meta name="description"[^/]*\/>/, "")
    .replace("</head>", `    ${metaTags}\n  </head>`)
}

function spaPrerender(): Plugin {
  return {
    name: "spa-prerender",
    closeBundle: {
      sequential: true,
      handler() {
        const distDir = path.resolve(__dirname, "dist")
        const rawHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8")

        const routes = buildRouteMeta()
        const homeMeta = routes.find((r) => r.path === "/")!

        fs.writeFileSync(path.join(distDir, "index.html"), injectMeta(rawHtml, homeMeta))
        fs.writeFileSync(path.join(distDir, "404.html"), injectMeta(rawHtml, homeMeta))

        for (const meta of routes.filter((r) => r.path !== "/")) {
          const routePath = meta.path.slice(1)
          const dir = path.join(distDir, routePath)
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, "index.html"), injectMeta(rawHtml, meta))
        }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), contentPlugin(), spaPrerender()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
