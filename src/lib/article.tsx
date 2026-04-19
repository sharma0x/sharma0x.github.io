import { useMemo, type ReactNode } from "react"
import { CodeBlock, InlineCode } from "@/components/ui/code-block"

interface Block {
  type: "paragraph" | "heading" | "list" | "code" | "hr" | "ordered_list"
  content: string
  level?: number
  items?: string[]
  lang?: string
  title?: string
}

function parseMarkdown(md: string): Block[] {
  const lines = md.split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("```")) {
      const langLine = line.slice(3)
      const langMatch = langLine.match(/^(\w+)(?:\s+title="([^"]*)")?/)
      const lang = langMatch ? langMatch[1] : "text"
      const title = langMatch ? langMatch[2] : undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push({ type: "code", content: codeLines.join("\n"), lang, title })
      i++
      continue
    }

    if (line.match(/^### /)) {
      blocks.push({ type: "heading", content: line.slice(4), level: 3 })
      i++
      continue
    }
    if (line.match(/^## /)) {
      blocks.push({ type: "heading", content: line.slice(3), level: 2 })
      i++
      continue
    }
    if (line.match(/^# /)) {
      blocks.push({ type: "heading", content: line.slice(2), level: 1 })
      i++
      continue
    }

    if (line.match(/^---\s*$/)) {
      blocks.push({ type: "hr", content: "" })
      i++
      continue
    }

    if (line.match(/^- /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].replace(/^- /, ""))
        i++
      }
      blocks.push({ type: "list", content: "", items })
      continue
    }

    if (line.match(/^\d+\. /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""))
        i++
      }
      blocks.push({ type: "ordered_list", content: "", items })
      continue
    }

    if (line.trim() === "") {
      i++
      continue
    }

    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("- ") && !lines[i].match(/^---\s*$/) && !lines[i].match(/^\d+\. /)) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join(" ") })
    }
  }

  return blocks
}

function renderInline(text: string) {
  const parts: (string | ReactNode)[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`/)
    const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*/)

    let firstMatch: { type: "code" | "bold"; index: number; fullLength: number; content: string; prefix: string } | null = null

    if (codeMatch && codeMatch[1].length < (boldMatch ? boldMatch[1].length : Infinity)) {
      firstMatch = { type: "code", index: codeMatch[1].length, fullLength: codeMatch[0].length, content: codeMatch[2], prefix: codeMatch[1] }
    } else if (boldMatch) {
      firstMatch = { type: "bold", index: boldMatch[1].length, fullLength: boldMatch[0].length, content: boldMatch[2], prefix: boldMatch[1] }
    }

    if (firstMatch) {
      if (firstMatch.prefix) {
        parts.push(<span key={key++}>{firstMatch.prefix}</span>)
      }
      if (firstMatch.type === "code") {
        parts.push(<InlineCode key={key++}>{firstMatch.content}</InlineCode>)
      } else {
        parts.push(<strong key={key++}>{firstMatch.content}</strong>)
      }
      remaining = remaining.slice(firstMatch.prefix.length + firstMatch.fullLength - firstMatch.prefix.length)
    } else if (remaining.match(/\*\*([^*]+)\*\*/)) {
      const m = remaining.match(/\*\*([^*]+)\*\*/)!
      const before = remaining.slice(0, remaining.indexOf("**"))
      parts.push(<span key={key++}>{before}</span>)
      parts.push(<strong key={key++}>{m[1]}</strong>)
      remaining = remaining.slice(before.length + m[0].length)
    } else if (remaining.match(/`([^`]+)`/)) {
      const m = remaining.match(/`([^`]+)`/)!
      const before = remaining.slice(0, remaining.indexOf("`"))
      parts.push(<span key={key++}>{before}</span>)
      parts.push(<InlineCode key={key++}>{m[1]}</InlineCode>)
      remaining = remaining.slice(before.length + m[0].length)
    } else {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }
  }

  return parts
}

export function ArticleContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseMarkdown(content), [content])

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = `h${block.level}` as "h1" | "h2" | "h3"
          return <Tag key={i}>{renderInline(block.content)}</Tag>
        }
        if (block.type === "paragraph") {
          return <p key={i}>{renderInline(block.content)}</p>
        }
        if (block.type === "list") {
          return (
            <ul key={i}>
              {block.items?.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === "ordered_list") {
          return (
            <ol key={i}>
              {block.items?.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          )
        }
        if (block.type === "code") {
          return (
            <CodeBlock
              key={i}
              code={block.content}
              lang={block.lang || "text"}
              title={block.title}
            />
          )
        }
        if (block.type === "hr") {
          return <hr key={i} />
        }
        return null
      })}
    </>
  )
}