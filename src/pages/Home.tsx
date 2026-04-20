import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import { IconBrandGithub, IconBrandLinkedin, IconBrandYoutube, IconMail } from "@tabler/icons-react"
import { ProjectsSection } from "@/components/ProjectsSection"
import { BlogsSection } from "@/components/BlogsSection"
import { ActivitySection } from "@/components/ActivitySection"
import { useCal } from "@/components/CalDialog"

const skills = [
  "Python",
  "TypeScript",
  "Next.js",
  "React",
  "FastAPI",
  "PostgreSQL",
  "AWS",
  "Docker",
  "C/C++",
  "LangChain",
]

const socials = [
  { href: "https://linkedin.com/in/sharma0x", label: "LinkedIn", Icon: IconBrandLinkedin },
  { href: "https://github.com/sharma0x", label: "GitHub", Icon: IconBrandGithub },
  { href: "https://www.youtube.com/@princebits", label: "YouTube", Icon: IconBrandYoutube },
  { href: "mailto:sharma0x@proton.me", label: "Email", Icon: IconMail },
]

export function Home() {
  const { ensureLoaded } = useCal()

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-start md:justify-center pt-20 pb-8 md:pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect x='4' y='4' width='10' height='10' rx='2.5' fill='%238080801a'/%3E%3Crect x='18' y='4' width='10' height='10' rx='2.5' fill='%238080801a'/%3E%3Crect x='4' y='18' width='10' height='10' rx='2.5' fill='%238080801a'/%3E%3Crect x='18' y='18' width='10' height='10' rx='2.5' fill='%238080801a'/%3E%3C/svg%3E")`,
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-background/40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
        </div>

        <section className="relative w-full max-w-6xl px-6 flex flex-col items-center text-center mt-4 md:mt-10">
          <div className="flex flex-col items-center gap-4">
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden ring-2 ring-border/60 shadow-lg hero-fade-in" style={{ animationDelay: '0ms' }}>
              <img src="/my-pic.jpeg" alt="Prince Sharma" width={128} height={128} className="h-full w-full object-cover" />
            </div>

            <div className="flex items-center gap-2 hero-fade-in" style={{ animationDelay: '80ms' }}>
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" stroke={1.5} />
                </a>
              ))}
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm font-medium text-brand backdrop-blur-sm hero-fade-in" style={{ animationDelay: '160ms' }}>
              Senior Software Engineer @ Synopsys
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground max-w-3xl text-balance leading-tight md:leading-tight hero-fade-in" style={{ animationDelay: '240ms' }}>
              Prince Sharma
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl text-balance leading-relaxed hero-fade-in" style={{ animationDelay: '320ms' }}>
              Building resilient systems at the intersection of backend infrastructure, cloud platforms, and agentic AI.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-md hero-fade-in" style={{ animationDelay: '400ms' }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border/50 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto hero-fade-in" style={{ animationDelay: '480ms' }}>
              <Button size="lg"
                data-cal-namespace="30min"
                data-cal-link="sharma0x/30min"
                data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                onMouseEnter={ensureLoaded}
                className="w-full sm:w-auto rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-8 h-12 text-sm transition-transform active:scale-95"
              >
                Get in touch <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto rounded-full border-border bg-card hover:bg-muted font-semibold px-8 h-12 text-sm transition-transform active:scale-95">
                <a href="https://github.com/sharma0x" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" strokeWidth={1.5} /> GitHub
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <section className="w-full bg-background animate-fade-in">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 md:py-32">
          <ProjectsSection />
          <div className="mt-24 md:mt-32 w-full" id="blog">
            <BlogsSection />
          </div>
          <div className="mt-24 md:mt-32 w-full" id="activity">
            <ActivitySection />
          </div>
        </div>
      </section>
    </>
  )
}