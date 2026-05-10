import { Link } from 'react-router-dom'
import { ArrowRight, Award, BookOpen, Flame, PlayCircle, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'
import { courses, subjects } from '../data/courses'

type LessonProgressRow = {
  course_id: string
  lesson_id: string
  completed: boolean | null
  last_started_at: string | null
}

export function Home() {
  const { user, profile } = useAuth()
  const [funFact, setFunFact] = useState<string | null>(null)
  const [funFactError, setFunFactError] = useState<string | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRow[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)

  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const progressData = useMemo(() => {
    const data: Record<string, string[]> = {}
    lessonProgress.forEach((row) => {
      if (row.completed) {
        data[row.course_id] = data[row.course_id] || []
        data[row.course_id].push(row.lesson_id)
      }
    })
    return data
  }, [lessonProgress])

  const enrolledCourses = courses.filter((course) => {
    const completed = progressData[course.id]?.length || 0
    const hasStarted = lessonProgress.some((row) => row.course_id === course.id)
    return (completed > 0 || hasStarted) && completed < course.lessons.length
  })

  const totalLessonsCompleted = Object.values(progressData).reduce(
    (acc, lessons) => acc + lessons.length,
    0,
  )

  const completedCourses = courses.filter((course) => {
    const completed = progressData[course.id]?.length || 0
    return completed === course.lessons.length && completed > 0
  }).length

  const continueTarget = enrolledCourses
    .map((course) => {
      const completed = progressData[course.id] || []
      const lastRow = lessonProgress
        .filter((row) => row.course_id === course.id)
        .sort((a, b) => {
          const aTime = a.last_started_at ? Date.parse(a.last_started_at) : 0
          const bTime = b.last_started_at ? Date.parse(b.last_started_at) : 0
          return bTime - aTime
        })[0]

      const lastLesson = course.lessons.find((lesson) => lesson.id === lastRow?.lesson_id)
      const nextLesson =
        lastLesson && !completed.includes(lastLesson.id)
          ? lastLesson
          : course.lessons.find((lesson) => !completed.includes(lesson.id))

      return {
        course,
        nextLesson,
        lastStartedAt: lastRow?.last_started_at
          ? Date.parse(lastRow.last_started_at)
          : 0,
      }
    })
    .sort((a, b) => b.lastStartedAt - a.lastStartedAt)[0]

  const continueSubject = continueTarget
    ? subjects.find((subject) => subject.id === continueTarget.course.subjectId)
    : undefined

  useEffect(() => {
    const loadFact = async () => {
      try {
        const res = await fetch(
          'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en',
        )
        if (!res.ok) throw new Error('Failed to load fact')
        const data = (await res.json()) as { text?: string }
        setFunFact(data.text ?? null)
      } catch {
        setFunFactError('Could not load a fun fact right now.')
      }
    }

    loadFact()
  }, [])

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return

      const { data } = await supabase
        .from('lesson_progress')
        .select('course_id, lesson_id, completed, last_started_at')
        .eq('user_id', user.id)

      setLessonProgress((data ?? []) as LessonProgressRow[])

      const { data: streakRow } = await supabase
        .from('user_streaks')
        .select('current_streak,last_completed_date')
        .eq('user_id', user.id)
        .maybeSingle()

      const today = getLocalDateString(new Date())
      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      const yesterday = getLocalDateString(yesterdayDate)
      const lastCompletedDate = streakRow?.last_completed_date ?? null

      if (lastCompletedDate && lastCompletedDate !== today && lastCompletedDate !== yesterday) {
        await supabase
          .from('user_streaks')
          .update({ current_streak: 0 })
          .eq('user_id', user.id)
        setCurrentStreak(0)
      } else {
        setCurrentStreak(streakRow?.current_streak ?? 0)
      }
    }

    loadProgress()
  }, [user])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="space-y-10 pb-12">
        <section className="bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 dark:from-cyan-900 dark:via-blue-950 dark:to-slate-950 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              {user && (
                <p className="mb-4 break-words text-3xl font-bold text-white md:text-4xl drop-shadow-sm">
                  Welcome back, {profile?.username || 'there'}
                </p>
              )}
              <h1 className="mb-6 break-words bg-gradient-to-r from-white via-cyan-50 to-amber-100 bg-clip-text pb-1 text-5xl font-bold leading-[1.2] text-transparent md:text-4xl">
                Master the Psychology of Life With Dianoia
              </h1>
              <p className="mb-8 break-words text-xl text-white/90">
                Explore the fascinating world of psychology through interactive lessons,
                practice exercises, and evidence-based learning. Understand the mind,
                behavior, and human experience.
              </p>

              {!user ? (
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link to="/login">
                    <Button size="lg" className="gap-2 bg-slate-950 text-white hover:bg-slate-900">
                      Log in <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/70 bg-white/10 text-white hover:bg-white/20"
                    >
                      Create account
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link to="/subjects">
                    <Button size="lg" className="gap-2 bg-slate-950 text-white hover:bg-slate-900">
                      Explore Psychology Courses <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {!user ? (
          <section className="py-10">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="mb-8 text-center text-3xl font-bold text-slate-900 dark:text-white">
                Why Choose Dianoia
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: 'Structured Lessons',
                    text: 'Clear, bite-sized modules that build real understanding.',
                    className:
                      'border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-100 dark:border-cyan-900 dark:from-cyan-950/50 dark:to-slate-950',
                  },
                  {
                    title: 'Practice & Quizzes',
                    text: 'Apply concepts with interactive questions and feedback.',
                    className:
                      'border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-rose-100 dark:border-fuchsia-900 dark:from-fuchsia-950/40 dark:to-slate-950',
                  },
                  {
                    title: 'Progress Tracking',
                    text: 'See your streaks, completed lessons, and growth.',
                    className:
                      'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-950',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border p-6 shadow-sm transition-transform hover:-translate-y-1 ${item.className}`}
                  >
                    <h3 className="mb-2 break-words text-lg font-semibold">{item.title}</h3>
                    <p className="break-words text-muted-foreground dark:text-white">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="py-10">
            <div className="max-w-6xl mx-auto px-4">
              <div className="mb-10 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-100 p-6 shadow-sm dark:border-cyan-900 dark:from-cyan-950/50 dark:via-blue-950/40 dark:to-slate-950">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-200">
                  Fun Fact
                </p>
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white">
                    <Sparkles className="size-5" />
                  </div>
                  <p className="break-words text-lg text-slate-900 dark:text-white">
                    {funFactError ?? funFact ?? 'Loading a fun fact...'}
                  </p>
                </div>
              </div>

              <div className="mb-10">
                {continueTarget?.nextLesson ? (
                  <Link
                    to={`/subjects/${continueTarget.course.subjectId}/${continueTarget.course.id}/${continueTarget.nextLesson.id}`}
                  >
                    <Card className="overflow-hidden border-cyan-200 bg-gradient-to-br from-white to-cyan-50 transition-shadow hover:shadow-lg dark:border-cyan-900 dark:from-slate-900 dark:to-slate-950">
                      <CardHeader>
                        <div className="mb-2 flex items-start justify-between">
                          <div
                            className={`flex size-10 items-center justify-center rounded-lg ${continueSubject?.color}`}
                          >
                            <div className="size-5 rounded bg-white/30" />
                          </div>
                        </div>
                        <CardTitle className="min-w-0 gap-2 text-2xl">
                          <span className="flex items-center gap-2">
                            <PlayCircle className="size-5" />
                            <span className="break-words">Continue Learning</span>
                          </span>
                        </CardTitle>
                        <p className="break-words text-muted-foreground dark:text-white">
                          {`${continueTarget.course.title} - ${continueTarget.nextLesson.title}`}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button size="lg" className="gap-2 bg-cyan-600 text-white hover:bg-cyan-700">
                          Continue Lesson <ArrowRight className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Card className="overflow-hidden border-violet-200 bg-gradient-to-br from-white to-violet-50 transition-shadow hover:shadow-lg dark:border-violet-900 dark:from-slate-900 dark:to-slate-950">
                      <CardHeader>
                        <CardTitle className="min-w-0 gap-2 text-2xl">
                          <span className="flex items-center gap-2">
                            <PlayCircle className="size-5" />
                            <span className="break-words">Your Dashboard</span>
                          </span>
                        </CardTitle>
                        <p className="break-words text-muted-foreground dark:text-white">
                          Pick up where you left off and track your progress.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button size="lg" variant="outline" className="gap-2">
                          View Dashboard <ArrowRight className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    label: 'Current Streak',
                    value: currentStreak,
                    icon: Flame,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                  },
                  {
                    label: 'Courses Completed',
                    value: completedCourses,
                    icon: Award,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                  },
                  {
                    label: 'Lessons Completed',
                    value: totalLessonsCompleted,
                    icon: BookOpen,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="mb-1 break-words text-sm text-muted-foreground dark:text-white">
                          {stat.label}
                        </p>
                        <p className="break-words text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div
                        className={`flex size-11 items-center justify-center rounded-lg ring-4 ring-white/60 dark:ring-slate-900 ${stat.bgColor}`}
                      >
                        <stat.icon className={`size-5 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
