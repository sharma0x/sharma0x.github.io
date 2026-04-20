import { useParams, Link, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { ArticleContent } from "@/lib/article"
import { blogRoutes } from "@/data/routes"

const blogMeta = Object.fromEntries(blogRoutes.map((b) => [b.slug, b]))

function stripFrontmatter(md: string): string {
  const match = md.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)
  return match ? match[1] : md
}

function BlogPostContent({ slug }: { slug: string }) {
  const meta = blogMeta[slug]
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/blog/${slug}.md`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.text()
      })
      .then((md) => {
        if (!cancelled) setContent(stripFrontmatter(md))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => { cancelled = true }
  }, [slug])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Failed to load post</h1>
          <p className="mt-2 text-muted-foreground">Could not fetch the blog post content.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-svh animate-fade-in">
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {meta.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
            {meta.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(meta.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </header>

        {content === null ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        ) : (
          <div className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-p:leading-relaxed
            prose-a:text-foreground prose-a:no-underline hover:prose-a:underline
            prose-strong:font-semibold
            prose-hr:border-border/40
          ">
            <ArticleContent content={content} />
          </div>
        )}
      </div>
    </article>
  )
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()

  if (!slug || !blogMeta[slug]) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-2 text-muted-foreground">The blog post you're looking for doesn't exist.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    )
  }

  return <BlogPostContent key={location.pathname} slug={slug} />
}
