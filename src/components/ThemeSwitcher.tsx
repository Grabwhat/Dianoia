import { useTheme } from 'next-themes'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm text-muted-foreground">
        Theme
      </label>
      <select
        id="theme-select"
        value={theme ?? 'system'}
        onChange={(e) => setTheme(e.target.value)}
        className="h-9 transition cursor-pointer rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
