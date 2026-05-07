import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courses, subjects } from '../data/courses'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Award, Clock, BookOpen, ArrowRight, Target, Flame } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'

export function Dashboard() {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState<{ [courseId: string]: string[] }>(
    {},
  )
  const [lessonProgress, setLessonProgress] = useState<
    {
      course_id: string
      lesson_id: string
      parts_completed: string[] | null
      completed: boolean | null
      last_started_at: string | null
    }[]
  >([])
  const [currentStreak, setCurrentStreak] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase
        .from('lesson_progress')
        .select('course_id, lesson_id, parts_completed, completed, last_started_at')
        .eq('user_id', user.id)

      const rows = data ?? []
      setLessonProgress(rows)

      const courseCompleted: { [courseId: string]: string[] } = {}
      rows.forEach((row) => {
        if (row.completed) {
          courseCompleted[row.course_id] = courseCompleted[row.course_id] || []
          courseCompleted[row.course_id].push(row.lesson_id)
        }
      })
      setProgressData(courseCompleted)

      const { data: streakRow } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle()
      setCurrentStreak(streakRow?.current_streak ?? 0)
    }

    load()
  }, [user])

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

  const totalTimeSpent = lessonProgress.reduce((acc, row) => {
    const course = courses.find((c) => c.id === row.course_id)
    const lesson = course?.lessons.find((l) => l.id === row.lesson_id)
    if (!lesson) return acc

    const parts = row.parts_completed ?? []
    const minutes = parts.length
      ? lesson.components.reduce((sum, component) => {
          if (!parts.includes(component.id)) return sum
          const value = parseInt(component.duration, 10)
          return sum + (Number.isNaN(value) ? 0 : value)
        }, 0)
      : row.completed
        ? lesson.components.reduce((sum, component) => {
            const value = parseInt(component.duration, 10)
            return sum + (Number.isNaN(value) ? 0 : value)
          }, 0)
        : 0

    return acc + minutes
  }, 0)

  const stats = [
    {
      icon: BookOpen,
      label: 'Lessons Completed',
      value: totalLessonsCompleted,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Award,
      label: 'Courses Completed',
      value: completedCourses,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Clock,
      label: 'Minutes Learned',
      value: totalTimeSpent,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Flame,
      label: 'Day Streak',
      value: currentStreak,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-8 py-10 text-white shadow-2xl shadow-cyan-500/20 dark:border-white/10 dark:from-sky-700 dark:via-cyan-700 dark:to-emerald-700">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            Your Learning Hub
          </p>
          <h1 className="mb-2 text-4xl font-black md:text-5xl">My Dashboard</h1>
          <p className="text-lg text-white/90">
            Track your learning progress and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-white/20 bg-white/85 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    {stat.label === 'Minutes Learned' ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-3xl font-bold cursor-pointer">
                            {stat.value}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {(stat.value / 60).toFixed(1)} hours
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <p className="text-3xl font-bold">{stat.value}</p>
                    )}
                  </div>
                  <div
                    className={`size-12 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-md ring-4 ring-white/50 dark:ring-slate-900/40`}
                  >
                    <stat.icon className={`size-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Continue Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const subject = subjects.find((s) => s.id === course.subjectId)
                const completedLessons = progressData[course.id] || []
                const progress =
                  (completedLessons.length / course.lessons.length) * 100
                const isComplete = completedLessons.length === course.lessons.length

                const lastRow = lessonProgress
                  .filter((row) => row.course_id === course.id)
                  .sort((a, b) => {
                    const aT = a.last_started_at ? Date.parse(a.last_started_at) : 0
                    const bT = b.last_started_at ? Date.parse(b.last_started_at) : 0
                    return bT - aT
                  })[0]

                const lastLesson = course.lessons.find(
                  (lesson) => lesson.id === lastRow?.lesson_id,
                )
                const nextLesson =
                  lastLesson && !completedLessons.includes(lastLesson.id)
                    ? lastLesson
                    : course.lessons.find(
                        (lesson) => !completedLessons.includes(lesson.id),
                      )
                const currentLessonParts =
                  nextLesson
                    ? lessonProgress.find(
                        (row) =>
                          row.course_id === course.id &&
                          row.lesson_id === nextLesson.id,
                      )?.parts_completed || []
                    : []

                return (
                  <Card
                    key={course.id}
                    className="border-white/20 bg-white/85 shadow-lg shadow-sky-500/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/20 dark:border-white/10 dark:bg-slate-950/75"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`size-10 ${subject?.color} rounded-lg flex items-center justify-center`}
                        >
                          <div className="size-5 bg-white/30 rounded" />
                        </div>
                        {isComplete ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {completedLessons.length} of {course.lessons.length} lessons completed
                        {nextLesson && (
                          <>
                            {' '}
                            · {currentLessonParts.length}/{nextLesson.components.length} parts
                            in {nextLesson.title}
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progress} className="h-2 mb-4" />
                      {!isComplete && nextLesson ? (
                        <Link to={`/subjects/${course.subjectId}/${course.id}/${nextLesson.id}`}>
                          <Button variant="outline" className="w-full gap-2">
                            Continue: {nextLesson.title}
                            <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/subjects/${course.subjectId}/${course.id}/overview`}>
                          <Button variant="outline" className="w-full gap-2">
                            Review Course
                            <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
            <Card className="mb-12 border-white/20 bg-white/85 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 shadow-lg dark:from-sky-900/70 dark:to-cyan-900/70">
                <BookOpen className="size-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t started any courses yet. Browse our subjects to get
                started!
              </p>
              <Link to="/subjects">
                <Button size="lg" className="gap-2">
                  Explore Courses <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {completedCourses > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-white/20 bg-white/85 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
                <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 shadow-lg dark:from-yellow-900/60 dark:to-amber-900/60">
                    <Award className="size-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-2">First Steps</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed your first lesson
                  </p>
                </CardContent>
              </Card>
              {completedCourses >= 1 && (
                <Card className="border-white/20 bg-white/85 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg dark:from-emerald-900/60 dark:to-green-900/60">
                      <Target className="size-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Course Master</h3>
                    <p className="text-sm text-muted-foreground">Completed a full course</p>
                  </CardContent>
                </Card>
              )}
              {currentStreak >= 7 && (
                <Card className="border-white/20 bg-white/85 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 shadow-lg dark:from-orange-900/60 dark:to-amber-900/60">
                      <Flame className="size-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Week Warrior</h3>
                    <p className="text-sm text-muted-foreground">7 day learning streak</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
