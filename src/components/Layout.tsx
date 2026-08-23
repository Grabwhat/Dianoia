import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Home,
  BookOpen,
  LayoutDashboard,
  Search,
  Target,
  Users,
} from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useEffect, useState } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useAuth } from './AuthProvider'
import { UserMenu } from './UserMenu'

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'Dianoia - Psychology Education'
  }, [])

  useEffect(() => {
    if (location.pathname === '/search') {
      const urlQuery = searchParams.get('q') || ''
      setSearchQuery(urlQuery)
    } else {
      setSearchQuery('')
    }
  }, [location.pathname, searchParams])

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-violet-500/20 ring-1 ring-violet-200 dark:bg-slate-950 dark:ring-violet-900/50">
                <img
                  src="/dianoia-logo.png"
                  alt="Dianoia logo"
                  className="size-full object-cover"
                />
              </div>
              <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 bg-clip-text pl-1 pr-3 text-xl font-extrabold text-transparent lg:inline dark:from-sky-300 dark:via-cyan-200 dark:to-indigo-300">
                Dianoia
              </span>
            </Link>

            <div className="flex-1 min-w-[240px] max-w-3xl">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for courses, topics, or skills..."
                    className="w-full rounded-2xl border-white/30 bg-white/80 pl-10 pr-4 text-foreground shadow-lg shadow-sky-500/10 placeholder:text-muted-foreground dark:border-white/10 dark:bg-slate-950/70"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-white/60 p-1.5 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/50 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Button
                      variant={isActive('/') && location.pathname === '/' ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-1.5 rounded-xl"
                    >
                      <Home className="size-4" />
                      <span className="hidden xl:inline">Home</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/subjects">
                    <Button
                      variant={isActive('/subjects') ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-1.5 rounded-xl"
                    >
                      <BookOpen className="size-4" />
                      <span className="hidden xl:inline">Subjects</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Subjects</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/our-mission">
                    <Button
                      variant={isActive('/our-mission') ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-1.5 rounded-xl"
                    >
                      <Target className="size-4" />
                      <span className="hidden xl:inline">Our Mission</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Our Mission</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/meet-the-crew">
                    <Button
                      variant={isActive('/meet-the-crew') ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-1.5 rounded-xl"
                    >
                      <Users className="size-4" />
                      <span className="hidden xl:inline">Meet the Crew</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meet the Crew</p>
                </TooltipContent>
              </Tooltip>


              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/dashboard">
                    <Button
                      variant={isActive('/dashboard') ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-1.5 rounded-xl"
                    >
                      <LayoutDashboard className="size-4" />
                      <span className="hidden xl:inline">Dashboard</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </nav>
            <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/60 px-3 py-2 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/50">
              {user ? (
                <UserMenu />
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
              )}
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-sky-50/60 via-background to-background dark:from-slate-950 dark:via-background dark:to-background">
        <Outlet />
      </main>
    </div>
  )
}
