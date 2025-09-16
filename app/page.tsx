import Dashboard from "@/components/dashboard"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
      <Dashboard />
    </main>
  )
}
