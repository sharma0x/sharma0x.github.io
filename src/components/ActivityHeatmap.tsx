import { useMemo, useState, useCallback } from "react"
import type { ActivitySource } from "@/hooks/useActivityData"
import { getLevel } from "@/hooks/useActivityData"

interface ActivityHeatmapProps {
  data: Record<string, number> | null
  source: ActivitySource
  loading: boolean
}

const CELL_SIZE = 13
const CELL_GAP = 3
const CELL_STRIDE = CELL_SIZE + CELL_GAP
const DAY_LABEL_WIDTH = 36
const MONTH_LABEL_HEIGHT = 22
const WEEKS = 53
const DAYS = 7

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const DAY_NAMES = ["Mon", "Wed", "Fri"]

const GITHUB_COLORS = [
  "var(--hm-gh-0)",
  "var(--hm-gh-1)",
  "var(--hm-gh-2)",
  "var(--hm-gh-3)",
  "var(--hm-gh-4)",
]

const LEETCODE_COLORS = [
  "var(--hm-lc-0)",
  "var(--hm-lc-1)",
  "var(--hm-lc-2)",
  "var(--hm-lc-3)",
  "var(--hm-lc-4)",
]

function buildGridFromEnd(): Date[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const grid: Date[][] = []
  const endDayOfWeek = today.getDay()

  for (let weekOffset = WEEKS - 1; weekOffset >= 0; weekOffset--) {
    const weekDates: Date[] = []
    for (let day = 0; day < DAYS; day++) {
      const daysAgo = weekOffset * 7 + (endDayOfWeek - day)
      const d = new Date(today)
      d.setDate(d.getDate() - daysAgo)

      if (weekOffset === 0 && day > endDayOfWeek) {
        weekDates.push(new Date(0))
      } else {
        weekDates.push(d)
      }
    }
    grid.push(weekDates)
  }

  return grid
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatTooltipDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

const DAY_LABEL_ROWS = [1, 3, 5]

export function ActivityHeatmap({ data, source, loading }: ActivityHeatmapProps) {
  const [activeCell, setActiveCell] = useState<{
    dateKey: string
    date: Date
    count: number
    x: number
    y: number
  } | null>(null)
  const colors = source === "github" ? GITHUB_COLORS : LEETCODE_COLORS
  const label = source === "github" ? "contributions" : "submissions"

  const { grid, monthLabels } = useMemo(() => {
    const g = buildGridFromEnd()

    const labels: { text: string; col: number }[] = []
    let prevMonth = -1

    for (let col = 0; col < g.length; col++) {
      const sunday = g[col][0]
      if (sunday.getTime() === 0) continue
      const month = sunday.getMonth()
      if (month !== prevMonth) {
        labels.push({ text: MONTH_NAMES[month], col })
        prevMonth = month
      }
    }

    return { grid: g, monthLabels: labels }
  }, [])

  const gridWidth = WEEKS * CELL_STRIDE - CELL_GAP
  const gridHeight = DAYS * CELL_STRIDE - CELL_GAP
  const viewBoxWidth = DAY_LABEL_WIDTH + gridWidth
  const viewBoxHeight = MONTH_LABEL_HEIGHT + gridHeight

  const handleCellActivate = useCallback(
    (date: Date, col: number, row: number) => {
      const dateKey = formatDate(date)
      const count = data?.[dateKey] ?? 0
      setActiveCell({
        dateKey,
        date,
        count,
        x: col * CELL_STRIDE + DAY_LABEL_WIDTH + CELL_SIZE / 2,
        y: row * CELL_STRIDE + MONTH_LABEL_HEIGHT + CELL_SIZE + 4,
      })
    },
    [data]
  )

  const tooltipAbove = activeCell
    ? activeCell.y > MONTH_LABEL_HEIGHT + gridHeight / 2
    : false

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto pb-2">
        <div className="relative inline-block min-w-[680px] md:min-w-0 md:w-full">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMinYMid meet"
            className="w-full"
            role="img"
            aria-label={`${source === "github" ? "GitHub" : "LeetCode"} activity heatmap`}
          >
            <g transform={`translate(${DAY_LABEL_WIDTH}, ${MONTH_LABEL_HEIGHT})`}>
              {monthLabels.map(({ text, col }) => (
                <text
                  key={`${text}-${col}`}
                  x={col * CELL_STRIDE}
                  y={-6}
                  className="fill-muted-foreground"
                  style={{ fontSize: "11px" }}
                >
                  {text}
                </text>
              ))}

              {DAY_LABEL_ROWS.map((dayIndex) => (
                <text
                  key={dayIndex}
                  x={-DAY_LABEL_WIDTH + 4}
                  y={dayIndex * CELL_STRIDE + CELL_SIZE - 1}
                  className="fill-muted-foreground"
                  style={{ fontSize: "11px" }}
                >
                  {DAY_NAMES[dayIndex]}
                </text>
              ))}

              {grid.map((week, col) =>
                week.map((date, row) => {
                  if (date.getTime() === 0) return null

                  const dateKey = formatDate(date)
                  const count = data?.[dateKey] ?? 0
                  const level = loading ? -1 : getLevel(count, source)

                  const fill =
                    level === -1
                      ? "var(--hm-empty)"
                      : level === 0
                        ? colors[0]
                        : colors[level]

                  const isActive = activeCell?.dateKey === dateKey

                  return (
                    <rect
                      key={dateKey}
                      x={col * CELL_STRIDE}
                      y={row * CELL_STRIDE}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      rx={2.5}
                      fill={fill}
                      stroke={isActive ? "var(--foreground)" : "none"}
                      strokeWidth={isActive ? 2 : 0}
                      className={
                        level === -1
                          ? "animate-pulse"
                          : "transition-fill duration-150 cursor-pointer"
                      }
                      onMouseEnter={() => handleCellActivate(date, col, row)}
                      onMouseLeave={() => setActiveCell(null)}
                      onClick={() => handleCellActivate(date, col, row)}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        handleCellActivate(date, col, row)
                      }}
                    />
                  )
                })
              )}
            </g>
          </svg>

          {activeCell && !loading && (
            <div
              className="pointer-events-none absolute z-10 inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95 duration-150"
              style={{
                left: `${(activeCell.x / viewBoxWidth) * 100}%`,
                top: tooltipAbove
                  ? undefined
                  : `${(activeCell.y / viewBoxHeight) * 100}%`,
                bottom: tooltipAbove
                  ? `${100 - (activeCell.y / viewBoxHeight) * 100 + 2}%`
                  : undefined,
                transform: "translateX(-50%)",
              }}
            >
              <span className="font-medium">
                {formatTooltipDate(activeCell.date)}
              </span>
              <span className="text-background/70">
                {activeCell.count} {label}
              </span>
              <div
                className="absolute size-2 rotate-45 bg-foreground"
                style={{
                  ...(tooltipAbove
                    ? { bottom: -3, left: "50%", marginLeft: -4 }
                    : { top: -3, left: "50%", marginLeft: -4 }),
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {colors.map((color, i) => (
          <div
            key={i}
            className="h-[13px] w-[13px] rounded-[2.5px]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
        {activeCell && data && (
          <span className="ml-auto text-muted-foreground">
            {activeCell.count} {label} on{" "}
            {activeCell.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  )
}