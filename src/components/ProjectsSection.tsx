import { ArrowUpRight } from "lucide-react"
import { IconBrandGithub } from "@tabler/icons-react"
import { Link } from "react-router-dom"

const projects = [
  {
    slug: "calcom-architecture",
    title: "Cal.com",
    subtitle: "Open-Source Scheduling Infrastructure",
    description:
      "A modular, extensible scheduling platform built with Next.js, tRPC, and PostgreSQL. Architected an App Store pattern for third-party integrations and end-to-end type safety across the stack.",
    tags: ["System Design", "Next.js", "TypeScript"],
    github: "https://github.com/sharma0x",
  },
  {
    slug: "llm-wiki-architecture",
    title: "LLM Wiki",
    subtitle: "Compounding Knowledge Graph",
    description:
      "An autonomous AI-maintained personal knowledge base that replaces traditional RAG with a persistent, interlinked markdown wiki. Built with Python, Obsidian, and SHA-256 incremental tracking.",
    tags: ["LLMs", "RAG", "Automation"],
    github: "https://github.com/sharma0x",
  },
  {
    slug: "portfolio-v3",
    title: "Portfolio v3",
    subtitle: "This Website",
    description:
      "A conversion-focused landing page engineered with Vite, React, and shadcn/ui. Minimalist design with a focus on typography and responsive micro-interactions.",
    tags: ["React", "Vite", "shadcn/ui"],
    github: "https://github.com/sharma0x/sharma0x.github.io",
  },
]

export function ProjectsSection() {
  const [featured, ...rest] = projects

  return (
    <section className="relative w-full" id="projects">
      <p className="text-center text-muted-foreground text-base max-w-xl mx-auto">
        Open-source work and side projects exploring system design, developer tools, and infrastructure.
      </p>

      <div className="mt-10 flex flex-col gap-6 md:gap-8">
        <Link to={`/project/${featured.slug}`}>
          <article className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/50 p-8 md:p-10 transition-all duration-500 ease-out hover:bg-muted/60 hover:border-border hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:scale-[1.01] cursor-pointer">
            <a
              href={featured.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-brand/10 hover:text-foreground transition-colors"
            >
              <IconBrandGithub className="h-3 w-3" stroke={1.5} />
              GitHub
            </a>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                {featured.title}
              </h3>
              <p className="text-sm font-medium text-brand mt-1">
                {featured.subtitle}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-2xl">
                {featured.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
              <div className="flex flex-wrap gap-1.5">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </article>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rest.map((project) => (
            <Link key={project.slug} to={`/project/${project.slug}`}>
              <article className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/50 p-6 transition-all duration-500 ease-out hover:bg-muted/60 hover:border-border hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:scale-[1.02] cursor-pointer h-full">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors"
                >
                  <IconBrandGithub className="h-3 w-3" stroke={1.5} />
                  GitHub
                </a>

                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      {project.subtitle}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}