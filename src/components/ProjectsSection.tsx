import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

const projects = [
  {
    slug: "calcom-architecture",
    title: "Cal.com",
    subtitle: "Open-Source Scheduling Infrastructure",
    description:
      "A modular, extensible scheduling platform built with Next.js, tRPC, and PostgreSQL. Architected an App Store pattern for third-party integrations and end-to-end type safety across the stack.",
    tags: ["System Design", "Next.js", "TypeScript"],
  },
  {
    slug: "llm-wiki-architecture",
    title: "LLM Wiki",
    subtitle: "Compounding Knowledge Graph",
    description:
      "An autonomous AI-maintained personal knowledge base that replaces traditional RAG with a persistent, interlinked markdown wiki. Built with Python, Obsidian, and SHA-256 incremental tracking.",
    tags: ["LLMs", "RAG", "Automation"],
  },
  {
    slug: "portfolio-v3",
    title: "Portfolio v3",
    subtitle: "This Website",
    description:
      "A conversion-focused landing page engineered with Vite, React, and shadcn/ui. Minimalist design with a focus on typography, glassmorphism effects, and responsive micro-interactions.",
    tags: ["React", "Vite", "shadcn/ui"],
  },
]

export function ProjectsSection() {
  return (
    <section className="relative w-full" id="projects">
      <p className="text-center text-muted-foreground text-base max-w-xl mx-auto">
        Open-source work and side projects exploring system design, developer tools, and infrastructure.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10">
        {projects.map((project) => (
          <Link key={project.slug} to={`/project/${project.slug}`}>
            <article className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/50 p-6 transition-all duration-500 ease-out hover:bg-[oklch(0.2_0.01_260)] hover:border-transparent hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)] hover:text-white hover:scale-[1.02] cursor-pointer h-full">
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 group-hover:text-emerald-400 group-hover:bg-emerald-400/20">
                More
              </span>

              <div className="flex flex-col gap-3 pt-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-white">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-white/70">
                    {project.subtitle}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-white/70">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40 group-hover:border-white/10">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground group-hover:text-white/60 group-hover:bg-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-white/80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}