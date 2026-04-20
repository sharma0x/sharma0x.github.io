import { useState, useEffect, useCallback, useRef } from "react"

const GITHUB_USERNAME = "sharma0x"
const LEETCODE_USERNAME = "sharma0x"

const GITHUB_API = `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json`
const LEETCODE_API = `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/calendar`

const CACHE_TTL = 60 * 60 * 1000

export type ActivitySource = "github" | "leetcode"

export interface ActivityData {
  days: Record<string, number>
  total: number
  streak: number
}

interface CacheEntry {
  data: ActivityData
  timestamp: number
}

function getCacheKey(source: ActivitySource): string {
  return `activity-v2-${source}`
}

function readCache(source: ActivitySource): ActivityData | null {
  try {
    const raw = localStorage.getItem(getCacheKey(source))
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    return entry.data
  } catch {
    return null
  }
}

function writeCache(source: ActivitySource, data: ActivityData): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(getCacheKey(source), JSON.stringify(entry))
  } catch {
    // localStorage may be unavailable or full
  }
}

function calculateStreak(days: Record<string, number>): number {
  let streak = 0
  const d = new Date()
  while (true) {
    const key = d.toISOString().split("T")[0]
    if (days[key] && days[key] > 0) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

async function fetchGitHubData(): Promise<ActivityData> {
  const res = await fetch(GITHUB_API)
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`)
  const json = await res.json()

  const rawContrib = json.contributions ?? []
  const raw: Array<{ date?: string; contributionCount?: number; count?: number }> =
    Array.isArray(rawContrib[0])
      ? rawContrib.flat()
      : rawContrib

  const days: Record<string, number> = {}
  let total = 0

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const cutoff = oneYearAgo.toISOString().split("T")[0]

  for (const c of raw) {
    const date = (c.date || "").split("T")[0]
    if (!date || date < cutoff) continue
    const count = c.contributionCount ?? c.count ?? 0
    days[date] = (days[date] ?? 0) + count
    total += count
  }

  const streak = calculateStreak(days)
  return { days, total, streak }
}

async function fetchLeetCodeData(): Promise<ActivityData> {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  const responses = await Promise.all(
    years.map((y) => fetch(`${LEETCODE_API}?year=${y}`))
  )

  const jsons = await Promise.all(
    responses.map((res) =>
      res.ok
        ? res.json()
        : { submissionCalendar: "{}", streak: 0 }
    )
  )

  const merged: Record<string, number> = {}
  let bestStreak = 0
  for (const json of jsons) {
    const cal: Record<string, number> = JSON.parse(
      json.submissionCalendar || "{}"
    )
    for (const [ts, count] of Object.entries(cal)) {
      merged[ts] = (merged[ts] ?? 0) + (count as number)
    }
    if (json.streak > bestStreak) bestStreak = json.streak
  }

  const days: Record<string, number> = {}
  let total = 0

  const oneYearAgo = Math.floor(
    (Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000
  )

  for (const [timestamp, count] of Object.entries(merged)) {
    const ts = Number(timestamp)
    if (ts >= oneYearAgo) {
      const date = new Date(ts * 1000).toISOString().split("T")[0]
      days[date] = (days[date] ?? 0) + count
      total += count
    }
  }

  const streak =
    bestStreak > 0 ? bestStreak : calculateStreak(days)

  return { days, total, streak }
}

const fetchers: Record<ActivitySource, () => Promise<ActivityData>> = {
  github: fetchGitHubData,
  leetcode: fetchLeetCodeData,
}

export function useActivityData(source: ActivitySource) {
  const [data, setData] = useState<ActivityData | null>(() => readCache(source))
  const [loading, setLoading] = useState(!readCache(source))
  const [error, setError] = useState<string | null>(null)
  const sourceRef = useRef(source)

  useEffect(() => {
    sourceRef.current = source
  }, [source])

  useEffect(() => {
    let cancelled = false

    const cached = readCache(source)

    async function load() {
      if (cached) {
        setData(cached)
        setLoading(false)
      }

      if (isCacheFresh(source) && cached) {
        return
      }

      try {
        const result = await fetchers[source]()
        if (cancelled) return
        setData(result)
        writeCache(source, result)
        setError(null)
      } catch (err) {
        if (cancelled) return
        if (!cached) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch data"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [source])

  const retry = useCallback(() => {
    localStorage.removeItem(getCacheKey(sourceRef.current))
    setLoading(true)
    setError(null)
    setData(null)

    fetchers[sourceRef.current]()
      .then((result) => {
        setData(result)
        writeCache(sourceRef.current, result)
        setError(null)
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to fetch data"
        )
      })
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error, retry } as const
}

function isCacheFresh(source: ActivitySource): boolean {
  try {
    const raw = localStorage.getItem(getCacheKey(source))
    if (!raw) return false
    const entry: CacheEntry = JSON.parse(raw)
    return Date.now() - entry.timestamp < CACHE_TTL
  } catch {
    return false
  }
}

export function getLevel(
  count: number,
  source: ActivitySource
): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (source === "github") {
    if (count <= 3) return 1
    if (count <= 6) return 2
    if (count <= 9) return 3
    return 4
  }
  if (count <= 1) return 1
  if (count <= 2) return 2
  if (count <= 4) return 3
  return 4
}