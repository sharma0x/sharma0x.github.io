/* eslint-disable react-refresh/only-export-components */
import { getCalApi } from "@calcom/embed-react"
import { useState, useCallback, createContext, useContext, type ReactNode } from "react"

let calLoaded = false
let calLoadPromise: Promise<void> | null = null

function loadCal() {
  if (calLoaded) return Promise.resolve()
  if (calLoadPromise) return calLoadPromise

  calLoadPromise = (async () => {
    const cal = await getCalApi({ namespace: "30min" })
    cal("ui", {
      hideEventTypeDetails: false,
      layout: "month_view",
    })
    calLoaded = true
  })()

  return calLoadPromise
}

const CalContext = createContext<{ ensureLoaded: () => Promise<void>; loaded: boolean }>({
  ensureLoaded: () => Promise.resolve(),
  loaded: false,
})

export function CalProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(calLoaded)

  const ensureLoaded = useCallback(async () => {
    if (!loaded) {
      await loadCal()
      setLoaded(true)
    }
  }, [loaded])

  return (
    <CalContext.Provider value={{ ensureLoaded, loaded }}>
      {children}
    </CalContext.Provider>
  )
}

export function useCal() {
  return useContext(CalContext)
}