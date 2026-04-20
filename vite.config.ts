import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const blogSlugs = [
  "the-invisible-engine",
  "why-i-switched-to-opencode",
  "calcom-architecture",
  "llm-wiki-architecture",
]

const projectSlugs = [
  "calcom-architecture",
  "llm-wiki-architecture",
  "portfolio-v3",
]

const routes = [
  ...blogSlugs.map((slug) => `blog/${slug}`),
  ...projectSlugs.map((slug) => `project/${slug}`),
]

function spaPrerender(): Plugin {
  return {
    name: "spa-prerender",
    closeBundle: {
      sequential: true,
      handler() {
        const distDir = path.resolve(__dirname, "dist")
        const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8")

        fs.writeFileSync(path.join(distDir, "404.html"), indexHtml)

        for (const route of routes) {
          const dir = path.join(distDir, route)
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, "index.html"), indexHtml)
        }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), spaPrerender()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
