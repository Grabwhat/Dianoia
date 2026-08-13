import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  ClipboardCheck,
  Compass,
  Flame,
  Lightbulb,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'
import { courses, subjects } from '../data/courses'
import { Seo } from './Seo'

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

  const landingFeatures = [
    {
      title: 'Structured Lessons',
      text: 'Clear, beginner-friendly psychology lessons that turn complex ideas into practical learning.',
      icon: BookOpen,
      className:
        'border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-100 dark:border-cyan-900 dark:from-cyan-950/50 dark:to-slate-950',
    },
    {
      title: 'Practice & Quizzes',
      text: 'Apply psychology concepts through interactive quizzes, feedback, and free online practice.',
      icon: ClipboardCheck,
      className:
        'border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-rose-100 dark:border-fuchsia-900 dark:from-fuchsia-950/40 dark:to-slate-950',
    },
    {
      title: 'Progress Tracking',
      text: 'Track completed psychology courses, lesson streaks, and your growth over time.',
      icon: Flame,
      className:
        'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-950',
    },
  ]

  const learningSteps = [
    {
      title: 'Choose a psychology path',
      text: 'Start with a subject that matches your curiosity, from human behavior to mental health and cognition.',
      icon: Compass,
    },
    {
      title: 'Learn in focused parts',
      text: 'Move through articles, videos, and practice questions without feeling buried by information.',
      icon: Brain,
    },
    {
      title: 'Build lasting understanding',
      text: 'Use progress tracking and explanations to turn one lesson into a steady learning habit.',
      icon: Lightbulb,
    },
  ]

  const topicHighlights = [
    'Introductory psychology',
    'Human behavior',
    'Mental health concepts',
    'Cognition and learning',
    'Developmental psychology',
    'Research-based thinking',
  ]

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
      <Seo
        title="Dianoia | Free Online Psychology Courses and Lessons"
        description="Learn psychology online with Dianoia through free psychology courses, beginner-friendly lessons, quizzes, and progress tracking."
      />
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
                Explore free online psychology courses through interactive lessons,
                beginner-friendly practice exercises, and evidence-based learning.
                Learn psychology online while building a deeper understanding of the
                mind, behavior, and human experience.
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
              <div className="mb-10 grid gap-4 rounded-[2rem] border border-white/20 bg-white/80 p-5 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75 md:grid-cols-3">
                {[
                  ['Free', 'Psychology courses'],
                  ['Beginner-friendly', 'Lessons and quizzes'],
                  ['Self-paced', 'Progress tracking'],
                ].map(([value, label]) => (
                  <div key={label} className="px-4 py-3 text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground dark:text-slate-200">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-8 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                  Built for curious learners
                </p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Why Choose Dianoia
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {landingFeatures.map((item) => {
                  const Icon = item.icon
                  return (
                  <div
                    key={item.title}
                    className={`rounded-2xl border p-6 shadow-sm transition-transform hover:-translate-y-1 ${item.className}`}
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mb-2 break-words text-lg font-semibold">{item.title}</h3>
                    <p className="break-words text-muted-foreground dark:text-white">
                      {item.text}
                    </p>
                  </div>
                  )
                })}
              </div>

              <div className="mt-16 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
                    Learn with direction
                  </p>
                  <h2 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">
                    A professional learning path without the paywall
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground dark:text-slate-200">
                    Dianoia helps learners explore psychology through organized
                    courses, approachable explanations, and interactive review. It is
                    designed for students, independent learners, and anyone who wants
                    a thoughtful introduction to psychology before going deeper.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {topicHighlights.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-sky-900 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  {learningSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div
                        key={step.title}
                        className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-white/20 bg-white/85 p-5 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75"
                      >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-md">
                          <Icon className="size-6" />
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Step {index + 1}
                          </p>
                          <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground dark:text-slate-200">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-16 overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 p-8 text-white shadow-2xl shadow-cyan-500/20 dark:border-emerald-900">
                <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white/20">
                      <ShieldCheck className="size-6" />
                    </div>
                    <h2 className="mb-3 text-3xl font-black">
                      Start learning psychology with clarity, not clutter.
                    </h2>
                    <p className="max-w-3xl text-lg text-white/90">
                      Create a free account to save lesson progress, maintain your
                      streak, and return to the exact course you were working through.
                    </p>
                  </div>
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="gap-2 bg-slate-950 text-white shadow-lg hover:bg-slate-900"
                    >
                      Create account <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
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

              <div className="mt-12 rounded-[2rem] border border-white/20 bg-white/80 p-8 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Are Dianoia&apos;s psychology courses free?
                    </h3>
                    <p className="text-muted-foreground dark:text-slate-200">
                      Yes. Dianoia is built around free psychology courses and free
                      psychology lessons so learners can explore the subject without a
                      paywall.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Can beginners learn psychology here?
                    </h3>
                    <p className="text-muted-foreground dark:text-slate-200">
                      Absolutely. Our beginner-friendly psychology lessons are designed
                      for people who want an introduction to psychology before going
                      deeper into specialized topics.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      What topics do the courses cover?
                    </h3>
                    <p className="text-muted-foreground dark:text-slate-200">
                      Dianoia covers a range of psychology subjects, including mental
                      health, human behavior, cognition, development, and research-based
                      psychological concepts.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      How do I learn psychology online with Dianoia?
                    </h3>
                    <p className="text-muted-foreground dark:text-slate-200">
                      Create an account, choose a course, and work through free online
                      psychology lessons, quizzes, and progress tracking at your own
                      pace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
