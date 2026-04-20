import { useState } from "react"
import { IconBrandGithub } from "@tabler/icons-react"
import { Flame, RotateCw } from "lucide-react"
import { useActivityData, type ActivitySource } from "@/hooks/useActivityData"
import { ActivityHeatmap } from "@/components/ActivityHeatmap"

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-2.606-2.607a1.6 1.6 0 01-.462-1.11c0-.417.195-.835.462-1.102l2.606-2.607c.467-.467 1.111-.662 1.824-.662s1.357.195 1.823.662l2.697 2.607c.467.467.662 1.11.662 1.824s-.195 1.357-.662 1.823v.009zm-2.697-8.376l2.697 2.607c.467.467.662 1.111.662 1.824s-.195 1.357-.662 1.824l-2.697 2.607-2.606-2.607 2.606-2.607-4.338-4.338L4.65 14.478l2.606 2.607L4.65 19.692 1.953 17.085c-.467-.467-.662-1.111-.662-1.824s.195-1.357.662-1.824l8.005-7.905c.467-.467 1.111-.662 1.824-.662s1.357.195 1.824.662l2.606 2.607-2.607 2.607zm8.005-7.905l-2.606 2.607 2.606 2.607-2.606 2.607-2.606-2.607-2.607 2.607-2.606-2.607 2.606-2.607-4.338-4.338 2.607-2.607 4.338 4.338 2.606-2.607 2.607 2.607-2.607 2.607z" />
    </svg>
  )
}

function TabContent({ source }: { source: ActivitySource }) {
  const { data, loading, error, retry } = useActivityData(source)
  const label = source === "github" ? "contributions" : "submissions"

  if (error && !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground text-sm">
          Failed to load {source === "github" ? "GitHub" : "LeetCode"} activity data
        </p>
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <ActivityHeatmap
        data={data?.days ?? null}
        source={source}
        loading={loading && !data}
      />
      {data && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {data.total.toLocaleString()} {label} in {new Date().getFullYear()}
          </span>
          {data.streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {data.streak} day streak
            </span>
          )}
        </div>
      )}
    </>
  )
}

const tabs: { key: ActivitySource; label: string; icon: React.ReactNode }[] = [
  {
    key: "github",
    label: "GitHub",
    icon: <IconBrandGithub className="h-4 w-4" stroke={1.5} />,
  },
  {
    key: "leetcode",
    label: "LeetCode",
    icon: <LeetCodeIcon className="h-4 w-4" />,
  },
]

export function ActivitySection() {
  const [active, setActive] = useState<ActivitySource>("github")

  return (
    <section className="relative w-full" id="activity">
      <p className="text-center text-muted-foreground text-base max-w-xl mx-auto mb-6">
        Consistency across platforms over the past year
      </p>

      <TabContent key={active} source={active} />

      <div className="flex items-center justify-center mt-4 p-[3px] rounded-lg bg-muted w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              active === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  )
}