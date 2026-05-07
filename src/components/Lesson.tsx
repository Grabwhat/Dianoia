import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { courses, subjects } from '../data/courses'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Award,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'

export function Lesson() {
  const { subjectId, courseId, lessonId } = useParams()
  const { user } = useAuth()
  const course = courses.find((c) => c.id === courseId && c.subjectId === subjectId)
  const subject = subjects.find((s) => s.id === subjectId)
  const lesson = course?.lessons.find((l) => l.id === lessonId)

  const [isLessonComplete, setIsLessonComplete] = useState(false)
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>(
    {},
  )
  const [hintRevealed, setHintRevealed] = useState(false)
  const [questionStates, setQuestionStates] = useState<{
    [key: string]: {
      checked: boolean
      correct: boolean
      hadWrongAttempt: boolean
      showHint: boolean
    }
  }>({})
  const [completedParts, setCompletedParts] = useState<string[]>([])

  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !courseId || !lessonId) return
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('parts_completed, completed')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
        .maybeSingle()
      if (!error && data) {
        setCompletedParts(data.parts_completed ?? [])
        setIsLessonComplete(Boolean(data.completed))
      } else {
        setCompletedParts([])
        setIsLessonComplete(false)
      }

      await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            last_started_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,course_id,lesson_id' },
        )
    }

    loadProgress()
  }, [user, courseId, lessonId])

  if (!course || !subject || !lesson) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Link to="/subjects">
            <Button>Back to Subjects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentComponent = lesson.components[currentComponentIndex]
  const currentIndex = course.lessons.findIndex((l) => l.id === lessonId)
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null
  const isCompleted = isLessonComplete
  const partsCompletedCount = completedParts.length

  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const updateStreak = async () => {
    if (!user) return
    const today = getLocalDateString(new Date())
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = getLocalDateString(yesterdayDate)

    const { data } = await supabase
      .from('user_streaks')
      .select('current_streak,last_completed_date')
      .eq('user_id', user.id)
      .maybeSingle()

    const lastDate = data?.last_completed_date as string | null
    const current = data?.current_streak ?? 0

    if (lastDate === today) return

    const nextStreak = lastDate === yesterday ? current + 1 : 1

    await supabase.from('user_streaks').upsert(
      {
        user_id: user.id,
        current_streak: nextStreak,
        last_completed_date: today,
      },
      { onConflict: 'user_id' },
    )
  }

  const syncLessonCompletion = async (nextParts: string[]) => {
    if (!user || !lessonId || !courseId) return
    const allPartsDone = nextParts.length >= lesson.components.length
    const wasComplete = isLessonComplete
    setIsLessonComplete(allPartsDone)
    await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          parts_completed: nextParts,
          completed: allPartsDone,
          last_started_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id,lesson_id' },
      )
    if (allPartsDone && !wasComplete) {
      toast.success('Lesson completed!', {
        description: 'Great job! Keep learning.',
      })
      await updateStreak()
    }
  }

  const markPartComplete = () => {
    if (!lessonId) return
    const partId = currentComponent.id
    if (!completedParts.includes(partId)) {
      const nextParts = [...completedParts, partId]
      setCompletedParts(nextParts)
      syncLessonCompletion(nextParts)
    }
  }

  const unmarkPartComplete = () => {
    if (!lessonId) return
    const partId = currentComponent.id
    if (completedParts.includes(partId)) {
      const nextParts = completedParts.filter((id) => id !== partId)
      setCompletedParts(nextParts)
      syncLessonCompletion(nextParts)
    }
  }

  const handleCheckAnswer = (questionId: string, correctAnswer: number) => {
    const selectedAnswer = selectedAnswers[questionId]

    if (selectedAnswer === undefined) {
      toast.error('Please select an answer first')
      return
    }

    const isCorrect = selectedAnswer === correctAnswer

    if (isCorrect) {
      setQuestionStates((prev) => ({
        ...prev,
        [questionId]: {
          checked: true,
          correct: true,
          hadWrongAttempt: prev[questionId]?.hadWrongAttempt || false,
          showHint: false,
        },
      }))
      toast.success('Correct!', {
        description: 'Great job! Check out the explanation below.',
      })
    } else {
      setQuestionStates((prev) => ({
        ...prev,
        [questionId]: {
          checked: false,
          correct: false,
          hadWrongAttempt: true,
          showHint: true,
        },
      }))
      toast.error('Try again!', {
        description: "That's not quite right. Check the hint below for help.",
      })
    }
  }

  const allQuestionsCorrect =
    currentComponent.questions?.every((q) => questionStates[q.id]?.correct) || false

  useEffect(() => {
    if (allQuestionsCorrect && currentComponent.type === 'practice') {
      markPartComplete()
    }
  }, [allQuestionsCorrect, currentComponent.type])

  const handleNextQuestion = () => {
    if (
      currentComponent.questions &&
      currentQuestionIndex < currentComponent.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleNextComponent = () => {
    if (currentComponentIndex < lesson.components.length - 1) {
      setCurrentComponentIndex(currentComponentIndex + 1)
      setCurrentQuestionIndex(0)
      setSelectedAnswers({})
      setQuestionStates({})
      setHintRevealed(false)
    }
  }

  const handlePreviousComponent = () => {
    if (currentComponentIndex > 0) {
      setCurrentComponentIndex(currentComponentIndex - 1)
      setCurrentQuestionIndex(0)
      setSelectedAnswers({})
      setQuestionStates({})
      setHintRevealed(false)
    }
  }

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6 text-sm">
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
          <Link
            to={`/subjects/${subjectId}/${courseId}/overview`}
            className="text-blue-600 hover:underline"
          >
            {course.title}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-muted-foreground">{lesson.title}</span>
        </div>

        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 px-8 py-8 text-white shadow-2xl shadow-sky-500/20 dark:border-white/10 dark:from-sky-700 dark:via-cyan-700 dark:to-indigo-900">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Lesson Focus
              </p>
              <h1 className="text-4xl font-black mb-2">{lesson.title}</h1>
              <Badge variant="secondary" className="mt-2 border-white/20 bg-white/15 text-white">
                Part {currentComponentIndex + 1} of {lesson.components.length}:{' '}
                {currentComponent.title}
              </Badge>
            </div>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 border-green-200 flex-shrink-0">
                <CheckCircle className="size-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {currentComponent.type === 'video' && currentComponent.videoUrl && (
          <Card className="mb-8 border-white/20 bg-white/85 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>{currentComponent.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentComponent.content}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentComponent.videoUrl}
                  title={currentComponent.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        )}

        {currentComponent.type === 'article' && currentComponent.articleContent && (
          <Card className="mb-8 border-white/20 bg-white/85 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                {currentComponent.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentComponent.content}
              </p>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none dark:prose-invert">
              <div
                className="text-muted-foreground space-y-4"
                dangerouslySetInnerHTML={{ __html: currentComponent.articleContent }}
              />
            </CardContent>
          </Card>
        )}

        {currentComponent.type === 'practice' && currentComponent.questions && (
          <div className="mb-8">
            <Card className="border-white/20 bg-white/85 shadow-xl shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="size-5" />
                    {currentComponent.title}
                  </CardTitle>
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} of{' '}
                    {currentComponent.questions.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!allQuestionsCorrect ? (
                  <>
                    {currentComponent.questions[currentQuestionIndex] &&
                      (() => {
                        const question =
                          currentComponent.questions[currentQuestionIndex]
                        const questionState = questionStates[question.id]
                        const isQuestionCorrect = questionState?.correct
                        const hadWrongAttempt = questionState?.hadWrongAttempt
                        const showHint = questionState?.showHint

                        return (
                          <div className="space-y-6">
                            <div className="font-medium text-xl mb-6">
                              {question.question}
                            </div>

                            <div className="space-y-3 mb-6">
                              {question.options.map((option, oIndex) => {
                                const isSelected =
                                  selectedAnswers[question.id] === oIndex
                                const isCorrect = oIndex === question.correctAnswer
                                const showAsCorrect = isQuestionCorrect && isSelected
                                const showAsIncorrect =
                                  hadWrongAttempt && isSelected && !isCorrect

                                return (
                                  <button
                                    key={oIndex}
                                    onClick={() => {
                                      if (!isQuestionCorrect) {
                                        setSelectedAnswers((prev) => ({
                                          ...prev,
                                          [question.id]: oIndex,
                                        }))
                                      }
                                    }}
                                    disabled={isQuestionCorrect}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                      showAsCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                                        : showAsIncorrect
                                          ? 'border-red-500 bg-red-50 dark:bg-red-950/40'
                                          : isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                                            : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-slate-900 dark:border-slate-700 dark:hover:border-slate-500'
                                    } ${
                                      isQuestionCorrect
                                        ? 'cursor-not-allowed'
                                        : 'cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`size-5 rounded-full border-2 flex items-center justify-center ${
                                          showAsCorrect
                                            ? 'border-green-500 bg-green-500'
                                            : showAsIncorrect
                                              ? 'border-red-500 bg-red-500'
                                              : isSelected
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300'
                                        }`}
                                      >
                                        {(isSelected || showAsCorrect) && (
                                          <div className="size-2 bg-white rounded-full" />
                                        )}
                                      </div>
                                      <span
                                        className={
                                          showAsCorrect
                                            ? 'text-green-900 dark:text-green-100'
                                            : showAsIncorrect
                                              ? 'text-red-900 dark:text-red-100'
                                              : 'text-foreground'
                                        }
                                      >
                                        {option}
                                      </span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>

                            {hadWrongAttempt && !isQuestionCorrect && (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/40 dark:border-red-900/40">
                                <p className="text-red-800 dark:text-red-200 font-medium">
                                  That's not quite right. Try again!
                                </p>
                              </div>
                            )}

                            {showHint && !isQuestionCorrect && question.hint && (
                              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900/40">
                                {!hintRevealed ? (
                                  <button
                                    onClick={() => setHintRevealed(true)}
                                    className="px-3 py-2 bg-yellow-200 hover:bg-yellow-300 rounded-md text-yellow-900 font-medium dark:bg-yellow-900/60 dark:text-yellow-100 dark:hover:bg-yellow-900/80"
                                  >
                                    Reveal Hint
                                  </button>
                                ) : (
                                  <div className="flex items-start gap-3">
                                    <Lightbulb className="size-6 text-yellow-600 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                                        Hint:
                                      </div>
                                      <div className="text-yellow-800 dark:text-yellow-200">
                                        {question.hint}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {!isQuestionCorrect && (
                              <Button
                                onClick={() =>
                                  handleCheckAnswer(
                                    question.id,
                                    question.correctAnswer,
                                  )
                                }
                                className="w-full"
                                size="lg"
                              >
                                Check Answer
                              </Button>
                            )}

                            {isQuestionCorrect && (
                              <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/40 dark:border-green-900/40">
                                  <p className="text-green-800 dark:text-green-200 font-medium text-lg">
                                    Correct!
                                  </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/40">
                                  <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Explanation:
                                  </div>
                                  <div className="text-blue-800 dark:text-blue-200">
                                    {question.explanation}
                                  </div>
                                </div>

                                {currentQuestionIndex <
                                currentComponent.questions.length - 1 ? (
                                  <Button
                                    onClick={handleNextQuestion}
                                    className="w-full gap-2"
                                    size="lg"
                                  >
                                    Next Question
                                    <ChevronRight className="size-5" />
                                  </Button>
                                ) : (
                                  <div className="text-center">
                                    <p className="text-muted-foreground mb-4">
                                      This was the last question!
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-100 rounded-full">
                        <Award className="size-8 text-green-600" />
                        <span className="font-bold text-green-900 text-2xl">
                          Quiz Complete!
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground text-lg mb-3">
                      You got{' '}
                      {
                        currentComponent.questions.filter(
                          (q) => !questionStates[q.id]?.hadWrongAttempt,
                        ).length
                      }{' '}
                      out of {currentComponent.questions.length} correct on your first
                      try
                    </div>
                    {currentComponent.questions.some(
                      (q) => questionStates[q.id]?.hadWrongAttempt,
                    ) && (
                      <div className="text-muted-foreground mb-6">
                        Some questions required multiple attempts - keep practicing!
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setCurrentQuestionIndex(0)
                        setSelectedAnswers({})
                        setQuestionStates({})
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Retake Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentComponent.type === 'video' && (
          <div className="mb-8">
            {completedParts.includes(currentComponent.id) ? (
              <Button onClick={unmarkPartComplete} size="lg" variant="outline" className="w-full gap-2 shadow-md">
                <CheckCircle className="size-5" />
                Unmark as Complete
              </Button>
            ) : (
              <Button onClick={markPartComplete} size="lg" className="w-full gap-2 shadow-lg shadow-sky-500/20">
                <CheckCircle className="size-5" />
                Mark this part as Complete
              </Button>
            )}
          </div>
        )}

        {currentComponent.type === 'article' && (
          <div className="mb-8">
            {completedParts.includes(currentComponent.id) ? (
              <Button onClick={unmarkPartComplete} size="lg" variant="outline" className="w-full gap-2 shadow-md">
                <CheckCircle className="size-5" />
                Unmark as Complete
              </Button>
            ) : (
              <Button onClick={markPartComplete} size="lg" className="w-full gap-2 shadow-lg shadow-sky-500/20">
                <CheckCircle className="size-5" />
                Mark this part as Complete
              </Button>
            )}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-white/75 p-3 shadow-lg shadow-sky-500/10 dark:border-white/10 dark:bg-slate-950/65">
          <Button
            onClick={handlePreviousComponent}
            disabled={currentComponentIndex === 0}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Previous Part
          </Button>
          <Button
            onClick={handleNextComponent}
            disabled={currentComponentIndex === lesson.components.length - 1}
            className="gap-2"
          >
            Next Part
            <ChevronRight className="size-4" />
          </Button>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-100">
            {partsCompletedCount}/{lesson.components.length} parts completed
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 pt-8 border-t">
          {previousLesson ? (
            <Link to={`/subjects/${subjectId}/${courseId}/${previousLesson.id}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="size-4" />
                Previous Lesson
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link to={`/subjects/${subjectId}/${courseId}/${nextLesson.id}`}>
              <Button className="gap-2">
                Next Lesson
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Link to={`/subjects/${subjectId}/${courseId}/overview`}>
              <Button variant="outline">Back to Course</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
