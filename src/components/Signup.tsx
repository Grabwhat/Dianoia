import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function Signup() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (signUpError) {
      setSubmitting(false)
      setError(signUpError.message)
      return
    }

    setSubmitting(false)
    navigate('/dashboard')
  }

  return (
    <div className="relative min-h-[70vh] overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-sky-50 to-emerald-100 dark:from-slate-950 dark:via-cyan-950/40 dark:to-emerald-950/40" />
      <div className="absolute left-0 top-10 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
      <div className="relative flex items-center justify-center">
      <Card className="w-full max-w-md border-white/30 bg-white/85 shadow-2xl shadow-sky-500/15 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="signup-username">
                Username
              </label>
              <Input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="signup-email">
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="signup-password">
                Password
              </label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm text-muted-foreground"
                htmlFor="signup-confirm"
              >
                Confirm password
              </label>
              <Input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
