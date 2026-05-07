import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { courses, subjects } from '../data/courses'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import {
  Clock,
  PlayCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'

export function Course() {
  const { subjectId, courseId } = useParams()
  const [searchParams] = useSearchParams()
  const course = courses.find((c) => c.id === courseId && c.subjectId === subjectId)
  const subject = subjects.find((s) => s.id === subjectId)

  const fromSearch = searchParams.get('from') === 'search'
  const searchQuery = searchParams.get('q') || ''

  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(`course-${courseId}-progress`)
    if (stored) {
      setCompletedLessons(JSON.parse(stored))
    }
  }, [courseId])

  if (!course || !subject) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/subjects">
            <Button>Back to Subjects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalDuration = course.lessons.reduce((acc, lesson) => {
    const lessonDuration = lesson.components.reduce((sum, component) => {
      const minutes = parseInt(component.duration, 10)
      return sum + (Number.isNaN(minutes) ? 0 : minutes)
    }, 0)
    return acc + lessonDuration
  }, 0)

  const progressPercentage =
    (completedLessons.length / course.lessons.length) * 100

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {fromSearch && (
          <div className="mb-6">
            <Link to={`/search?q=${encodeURIComponent(searchQuery)}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Search Results
              </Button>
            </Link>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/subjects" className="text-blue-600 hover:underline">
              Subjects
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              to={`/subjects?subject=${subjectId}`}
              className="text-blue-600 hover:underline"
            >
              {subject.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{course.title}</span>
          </div>

          <div className="flex items-start gap-6">
            <div
              className={`size-16 ${subject.color} rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <div className="size-8 bg-white/30 rounded" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{course.title}</h1>
                <Badge variant="secondary">{course.level}</Badge>
              </div>
              <p className="text-lg text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-5" />
                  <span>{course.lessons.length} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-5" />
                  <span>{totalDuration} minutes</span>
                </div>
              </div>
            </div>
          </div>

          {completedLessons.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm text-gray-600">
                    {completedLessons.length} of {course.lessons.length} completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id)
              const totalComponentDuration = lesson.components.reduce(
                (sum, component) => {
                  const minutes = parseInt(component.duration, 10)
                  return sum + (Number.isNaN(minutes) ? 0 : minutes)
                },
                0,
              )

              return (
                <Link key={lesson.id} to={`/subjects/${subjectId}/${courseId}/${lesson.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`size-10 rounded-lg flex items-center justify-center ${
                              isCompleted ? 'bg-green-100' : 'bg-gray-100'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="size-5 text-green-600" />
                            ) : (
                              <PlayCircle className="size-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">
                                Lesson {index + 1}
                              </span>
                              {isCompleted && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="size-4" />
                                <span>{totalComponentDuration} min</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {lesson.components.length} parts
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
