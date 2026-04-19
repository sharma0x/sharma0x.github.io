"use client"

import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { cn } from "@/lib/utils"

async function highlightCode(code: string, lang: string) {
  try {
    const html = await codeToHtml(code.trim(), {
      lang,
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
      defaultColor: false,
    })
    return html
  } catch {
    return `<pre><code>${code.trim()}</code></pre>`
  }
}

export function CodeBlock({
  code,
  lang = "typescript",
  title,
  className,
}: {
  code: string
  lang?: string
  title?: string
  className?: string
}) {
  const [html, setHtml] = useState<string>("")

  useEffect(() => {
    highlightCode(code, lang).then(setHtml)
  }, [code, lang])

  return (
    <figure className={cn("group relative my-6", className)}>
      {title && (
<figcaption className="flex items-center gap-2 rounded-t-xl border border-b-0 border-border/50 bg-muted/50 px-4 py-2.5">
           <div className="flex gap-1.5">
             <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
             <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
             <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
           </div>
          <span className="ml-2 text-xs font-medium text-muted-foreground font-mono">
            {title}
          </span>
        </figcaption>
      )}
      <div
        className={cn(
          "code-block-wrapper overflow-x-auto rounded-xl border border-border/50 p-4 text-sm leading-relaxed bg-white dark:bg-[#0d1117]",
          title && "rounded-t-none"
        )}
      >
        {html ? (
          <div
            className="[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:font-mono [&_code]:text-sm [&_.shiki]:!bg-transparent [&_.shiki]:!m-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>
    </figure>
  )
}

export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 text-[0.85em] font-mono font-normal text-foreground",
        className
      )}
    >
      {children}
    </code>
  )
}