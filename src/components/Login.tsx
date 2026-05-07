import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type LocationState = {
  from?: { pathname?: string }
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | undefined
  const redirectTo = state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="relative min-h-[70vh] overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-cyan-50 to-indigo-100 dark:from-slate-950 dark:via-sky-950/50 dark:to-indigo-950/50" />
      <div className="absolute left-0 top-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="relative flex items-center justify-center">
      <Card className="w-full max-w-md border-white/30 bg-white/85 shadow-2xl shadow-sky-500/15 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Log in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.from && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              Please log in to access your dashboard.
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="login-email">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm text-muted-foreground"
                htmlFor="login-password"
              >
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
