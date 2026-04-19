import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun } from "lucide-react"

export function DesignSystem() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Design System</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A showcase of the visual language, typography, colors, and components that make up the application's design system.
        </p>
      </div>

      <div className="space-y-16">
        {/* Typography Section */}
        <section>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Typography</h2>
            <p className="text-sm text-muted-foreground">Standard text styles and headings.</p>
          </div>
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Heading 1 (h1)</h1>
              <p className="text-sm text-muted-foreground mt-1">text-4xl font-extrabold lg:text-5xl</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight transition-colors first:mt-0">Heading 2 (h2)</h2>
              <p className="text-sm text-muted-foreground mt-1">text-3xl font-semibold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Heading 3 (h3)</h3>
              <p className="text-sm text-muted-foreground mt-1">text-2xl font-semibold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold tracking-tight">Heading 4 (h4)</h4>
              <p className="text-sm text-muted-foreground mt-1">text-xl font-semibold</p>
            </div>
            <div>
              <p className="leading-7 [&:not(:first-child)]:mt-6">
                <strong>Paragraph (p):</strong> The quick brown fox jumps over the lazy dog. This is an example of standard paragraph text used throughout the application. It has a generous line height for readability.
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <strong>Muted Text:</strong> This text is used for secondary information or descriptions. It has a lower contrast.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Buttons</h2>
            <p className="text-sm text-muted-foreground">Interactive elements for user actions.</p>
          </div>
          <div className="space-y-8 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Sizes</h3>
              <div className="flex flex-wrap items-end gap-4">
                <Button size="lg">Large</Button>
                <Button size="default">Default</Button>
                <Button size="sm">Small</Button>
                <Button size="icon"><Sun className="h-4 w-4" /></Button>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button>
                  <Moon className="mr-2 h-4 w-4" /> With Icon
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Badges</h2>
            <p className="text-sm text-muted-foreground">Small status indicators or tags.</p>
          </div>
          <div className="flex flex-wrap gap-4 rounded-xl border bg-card p-6 shadow-sm">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Inputs Section */}
        <section>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Inputs</h2>
            <p className="text-sm text-muted-foreground">Form controls for user input.</p>
          </div>
          <div className="max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="disabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Disabled Input
              </label>
              <Input id="disabled" disabled placeholder="Not allowed" />
            </div>
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                File Input
              </label>
              <Input id="file" type="file" />
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Cards</h2>
            <p className="text-sm text-muted-foreground">Containers for organizing content.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>This is a description inside the card header.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here. It provides the main information for the user to read.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Simple Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">A minimalist card just presenting basic data with some soft shadow and modern aesthetics.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
