import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Menu } from "lucide-react"
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback, lazy, Suspense } from "react"
import { Home } from "./pages/Home"
import { CalProvider, useCal } from "@/components/CalDialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

function BookCallButton({ className, onClick, children }: { className?: string; onClick?: () => void; children: React.ReactNode }) {
  const { ensureLoaded } = useCal()
  return (
    <Button
      data-cal-namespace="30min"
      data-cal-link="sharma0x/30min"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      className={className}
      onClick={onClick}
      onMouseEnter={ensureLoaded}
    >
      {children}
    </Button>
  )
}

const DesignSystem = lazy(() => import("./pages/DesignSystem").then(m => ({ default: m.DesignSystem })))
const BlogPost = lazy(() => import("./pages/Blog").then(m => ({ default: m.BlogPost })))
const ProjectPost = lazy(() => import("./pages/Project").then(m => ({ default: m.ProjectPost })))

const showDesignSystem = import.meta.env.DEV

function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function useScrollToSection() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback((id: string) => {
    if (pathname !== "/") {
      navigate("/", { replace: false })
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }
  }, [pathname, navigate])
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const scrollTo = useScrollToSection()

  const handleClick = (id: string) => {
    onNavigate?.()
    scrollTo(id)
  }

  return (
    <>
      <Link to="/" onClick={onNavigate} className="text-sm font-medium hover:text-foreground/80 transition-colors">Home</Link>
      <button onClick={() => handleClick("activity")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Activity</button>
      <button onClick={() => handleClick("projects")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Projects</button>
      <button onClick={() => handleClick("blog")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Blog</button>
    </>
  )
}

function AppContent() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <CalProvider>
    <div className="min-h-svh bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:text-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium">
        Skip to content
      </a>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex w-[92%] max-w-5xl items-center justify-between rounded-full bg-background/80 px-6 py-3 shadow-sm ring-1 ring-border/50 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-bold tracking-tight">sharma0x</Link>
          <nav className="hidden md:flex gap-6" aria-label="Main navigation">
            <NavLinks />
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <BookCallButton className="hidden sm:inline-flex h-10 rounded-full px-6 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90">
            Book a call
          </BookCallButton>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 md:hidden shrink-0 rounded-full" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4 mt-4" aria-label="Mobile navigation">
                <NavLinks onNavigate={() => setMobileMenuOpen(false)} />
              </nav>
              <div className="mt-6 px-4">
                <BookCallButton className="w-full h-10 rounded-full px-6 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90" onClick={() => setMobileMenuOpen(false)}>
                  Book a call
                </BookCallButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          {showDesignSystem && <Route path="/design-system" element={<Suspense fallback={<PageLoader />}><DesignSystem /></Suspense>} />}
          <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
          <Route path="/project/:slug" element={<Suspense fallback={<PageLoader />}><ProjectPost /></Suspense>} />
        </Routes>
      </div>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} sharma0x. All rights reserved.</p>
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