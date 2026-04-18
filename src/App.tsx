import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

export function App() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold">sharma0x</h1>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hi, I'm Prince Sharma
          </h2>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Developer, creator, and builder. Welcome to my portfolio.
          </p>
          <div className="mt-6 flex gap-4">
            <Button>View Projects</Button>
            <Button variant="outline">Get in Touch</Button>
          </div>
        </section>

        <section id="projects" className="py-16">
          <h3 className="mb-8 text-2xl font-semibold">Projects</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h4 className="font-semibold">Project Coming Soon</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                More projects will be added soon.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16">
          <h3 className="mb-8 text-2xl font-semibold">Contact</h3>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-muted-foreground">
              Interested in working together? Feel free to reach out.
            </p>
            <Button className="mt-4">Contact Me</Button>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} sharma0x. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App