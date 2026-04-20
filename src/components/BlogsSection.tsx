import { useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { blogRoutes } from "@/data/routes"

const BLOGS_PER_PAGE = 4

const allBlogs = blogRoutes

export function BlogsSection() {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(allBlogs.length / BLOGS_PER_PAGE)
  const blogs = allBlogs.slice(page * BLOGS_PER_PAGE, (page + 1) * BLOGS_PER_PAGE)

  return (
    <section className="w-full">
      <p className="text-center text-muted-foreground text-base max-w-xl mx-auto">
        Thoughts on system design, developer tooling, and the craft of engineering.
      </p>

      <div className="divide-y divide-border/60 mt-10">
        {blogs.map((blog) => (
          <Link
            key={blog.slug}
            to={`/blog/${blog.slug}`}
            className="group flex flex-col gap-2 py-6 first:pt-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-foreground leading-snug inline-block">
                  <span className="bg-[length:0_2px] bg-[position:0_100%] bg-no-repeat bg-gradient-to-r from-foreground to-foreground group-hover:bg-[length:100%_2px] transition-[background-size] duration-300 ease-out">
                    {blog.title}
                  </span>
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {blog.description}
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/70 tabular-nums">
                    {new Date(blog.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex gap-1.5">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground group-hover:bg-muted/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 mt-1.5 shrink-0 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}