import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Home } from "./pages/Home"
import { DesignSystem } from "./pages/DesignSystem"
import { BlogPost } from "./pages/Blog"
import { ProjectPost } from "./pages/Project"
import { CalProvider } from "@/components/CalDialog"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NavLinks() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const scrollTo = (id: string) => {
    if (pathname !== "/") {
      navigate("/", { replace: false })
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="hidden md:flex gap-6">
      <Link to="/" className="text-sm font-medium hover:text-foreground/80 transition-colors">Home</Link>
      <button onClick={() => scrollTo("projects")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Projects</button>
      <button onClick={() => scrollTo("blog")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Blog</button>
    </nav>
  )
}

function AppContent() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <CalProvider>
    <div className="min-h-svh bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex w-[92%] max-w-5xl items-center justify-between rounded-full bg-background/80 px-6 py-3 shadow-sm ring-1 ring-border/50 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-bold tracking-tight">sharma0x.</Link>
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            data-cal-namespace="30min"
            data-cal-link="sharma0x/30min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className="hidden sm:inline-flex h-10 rounded-full px-6 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
          >
            Book a call
          </Button>
        </div>
      </header>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/project/:slug" element={<ProjectPost />} />
        </Routes>
      </div>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} sharma0x. All rights reserved.</p>
      </footer>
    </div>
    </CalProvider>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App