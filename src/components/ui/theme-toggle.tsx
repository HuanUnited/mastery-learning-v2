import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative h-8 w-14 rounded-full p-0"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Track */}
      <div className="absolute inset-0 rounded-full bg-white/20 border border-white/30 transition-colors" />
      
      {/* Toggle Thumb */}
      <div
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-[28px]' : 'translate-x-1'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="h-3.5 w-3.5 text-slate-900" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        )}
      </div>
    </Button>
  )
}
