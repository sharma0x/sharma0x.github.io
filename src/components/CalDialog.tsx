import { getCalApi } from "@calcom/embed-react"
import { useEffect } from "react"

export function CalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi({ namespace: "30min" })
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      })
    })()
  }, [])

  return <>{children}</>
}