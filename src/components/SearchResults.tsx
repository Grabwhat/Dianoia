import { Link, useSearchParams } from 'react-router-dom'
import { courses, subjects } from '../data/courses'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Clock, PlayCircle, Search } from 'lucide-react'

export function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const searchResults = query.trim()
    ? courses.filter((course) => {
        const subject = subjects.find((s) => s.id === course.subjectId)
        const searchLower = query.toLowerCase().trim()

        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          subject?.name.toLowerCase().includes(searchLower) ||
          subject?.description.toLowerCase().includes(searchLower)
        )
      })
    : []

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 px-8 py-10 text-white shadow-2xl shadow-sky-500/20 dark:border-white/10 dark:from-cyan-500 dark:via-sky-700 dark:to-indigo-900">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/subjects" className="text-white/90 hover:text-white hover:underline">
              Subjects
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-white/80">Search Results</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Search className="size-8 text-white/80" />
            <h1 className="text-4xl font-black md:text-5xl">
              Search Results for "{query}"
            </h1>
          </div>
          <p className="text-lg text-white/90">
            Found {searchResults.length}{' '}
            {searchResults.length === 1 ? 'course' : 'courses'}
          </p>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((course) => {
              const subject = subjects.find((s) => s.id === course.subjectId)
              const totalDuration = course.lessons.reduce((acc, lesson) => {
                const lessonMinutes = lesson.components.reduce((sum, component) => {
                  const minutes = parseInt(component.duration, 10)
                  return sum + (Number.isNaN(minutes) ? 0 : minutes)
                }, 0)
                return acc + lessonMinutes
              }, 0)

              return (
                <Link
                  key={course.id}
                  to={`/subjects/${course.subjectId}/${course.id}/overview?from=search&q=${encodeURIComponent(
                    query,
                  )}`}
                >
                  <Card className="h-full cursor-pointer overflow-hidden border-white/20 bg-white/85 shadow-lg shadow-sky-500/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/20 dark:border-white/10 dark:bg-slate-950/75">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`size-12 ${subject?.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                        >
                          <div className="size-6 bg-white/30 rounded" />
                        </div>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
                        {subject?.name}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="size-4" />
                          <span>{course.lessons.length} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="size-4" />
                          <span>{totalDuration} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto max-w-md rounded-[2rem] border border-white/20 bg-white/80 px-8 py-10 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 shadow-lg dark:from-sky-900/70 dark:to-cyan-900/70">
                <Search className="size-8 text-sky-600 dark:text-sky-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No courses found</h2>
              <p className="mb-6 text-muted-foreground">
                We couldn't find any courses matching "{query}". Try searching with
                different keywords or browse all subjects.
              </p>
              <Link to="/subjects">
                <Button>Browse All Subjects</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
