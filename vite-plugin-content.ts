import path from "path"
import fs from "fs"
import type { Plugin } from "vite"

const VIRTUAL_ID = "virtual:content-routes"
const RESOLVED_ID = "\0" + VIRTUAL_ID

interface BlogFrontmatter {
  title: string
  description: string
  date: string
  tags: string[]
}

interface ProjectFrontmatter {
  title: string
  subtitle: string
  description: string
  date: string
  tags: string[]
  github: string
}

interface ParsedBlog {
  slug: string
  frontmatter: BlogFrontmatter
}

interface ParsedProject {
  slug: string
  frontmatter: ProjectFrontmatter
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const data: Record<string, unknown> = {}
  const lines = match[1].split("\n")
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) { i++; continue }
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (val === "" && i + 1 < lines.length && lines[i + 1].match(/^\s+-\s/)) {
      const items: string[] = []
      i++
      while (i < lines.length && lines[i].match(/^\s+-\s/)) {
        items.push(lines[i].replace(/^\s+-\s/, "").replace(/^['"]|['"]$/g, ""))
        i++
      }
      data[key] = items
    } else if (val.startsWith("[")) {
      data[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
      i++
    } else {
      data[key] = val.replace(/^['"]|['"]$/g, "")
      i++
    }
  }
  return { data, content: match[2] }
}

function readContentDir<T>(dir: string): { slug: string; frontmatter: T; raw: string }[] {
  const contentDir = path.resolve(__dirname, "content", dir)
  if (!fs.existsSync(contentDir)) return []
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(contentDir, f), "utf-8")
      const { data } = parseFrontmatter(raw)
      return { slug: f.replace(/\.md$/, ""), frontmatter: data as T, raw }
    })
}

function invalidateCache() {
  cachedBlogs = null
  cachedProjects = null
}

let cachedBlogs: ParsedBlog[] | null = null
let cachedProjects: ParsedProject[] | null = null

function getBlogs(): ParsedBlog[] {
  if (!cachedBlogs) {
    cachedBlogs = readContentDir<BlogFrontmatter>("blog").map(({ slug, frontmatter }) => ({
      slug,
      frontmatter,
    }))
  }
  return cachedBlogs
}

function getProjects(): ParsedProject[] {
  if (!cachedProjects) {
    cachedProjects = readContentDir<ProjectFrontmatter>("project").map(
      ({ slug, frontmatter }) => ({ slug, frontmatter })
    )
  }
  return cachedProjects
}

function generateVirtualModule(): string {
  const blogs = getBlogs()
  const projects = getProjects()
  return [
    `export const SITE_URL = "https://sharma0x.github.io"`,
    `export const SITE_NAME = "sharma0x"`,
    `export const SITE_DESCRIPTION = "Software engineer specializing in system design, developer tooling, and infrastructure."`,
    ``,
    `export const blogRoutes = ${JSON.stringify(
      blogs.map((b) => ({ slug: b.slug, ...b.frontmatter })),
      null,
      2
    )}`,
    ``,
    `export const projectRoutes = ${JSON.stringify(
      projects.map((p) => ({ slug: p.slug, ...p.frontmatter })),
      null,
      2
    )}`,
  ].join("\n")
}

function syncToPublic() {
  for (const dir of ["blog", "project"]) {
    const contentDir = path.resolve(__dirname, "content", dir)
    const publicDir = path.resolve(__dirname, "public", dir)
    if (!fs.existsSync(contentDir)) continue
    fs.mkdirSync(publicDir, { recursive: true })
    for (const f of fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"))) {
      fs.copyFileSync(path.join(contentDir, f), path.join(publicDir, f))
    }
  }
}

export function contentPlugin(): Plugin {
  return {
    name: "content-plugin",

    buildStart() {
      syncToPublic()
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id === RESOLVED_ID) return generateVirtualModule()
    },

    configureServer(server) {
      invalidateCache()

      server.watcher.add(path.resolve(__dirname, "content"))

      server.watcher.on("add", invalidateCache)
      server.watcher.on("change", invalidateCache)
      server.watcher.on("unlink", invalidateCache)

      server.watcher.on("add", (f) => {
        if (f.includes("/content/")) syncToPublic()
      })
      server.watcher.on("change", (f) => {
        if (f.includes("/content/")) syncToPublic()
      })
      server.watcher.on("unlink", (f) => {
        if (f.includes("/content/")) {
          syncToPublic()
          for (const dir of ["blog", "project"]) {
            const publicDir = path.resolve(__dirname, "public", dir)
            if (!fs.existsSync(publicDir)) continue
            const contentDir = path.resolve(__dirname, "content", dir)
            const contentFiles = fs.existsSync(contentDir)
              ? new Set(fs.readdirSync(contentDir).filter((f) => f.endsWith(".md")))
              : new Set<string>()
            for (const f of fs.readdirSync(publicDir).filter((f) => f.endsWith(".md"))) {
              if (!contentFiles.has(f)) fs.unlinkSync(path.join(publicDir, f))
            }
          }
        }
      })
    },
  }
}

export { getBlogs, getProjects }
export type { BlogFrontmatter, ProjectFrontmatter }
