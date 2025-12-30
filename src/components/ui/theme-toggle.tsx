import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/providers/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white/20 hover:bg-white/30 border border-white/30"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Toggle theme"
    >
      <span
        className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          theme === "dark" ? "translate-x-8" : "translate-x-1"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4 text-slate-800" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </span>
    </button>
  )
}
