import { BookOpen, Compass, HeartHandshake, Lightbulb, Sparkles, Telescope } from 'lucide-react'
import { Seo } from './Seo'

const principles = [
  {
    title: 'Curiosity First',
    text: 'We aim to spark curiosity and keep it growing through clear, engaging content.',
    color: 'from-amber-400 to-orange-500',
    icon: Lightbulb,
  },
  {
    title: 'Accessible Knowledge',
    text: 'Dianoia is built to be open, dependable, and welcoming to learners at any stage.',
    color: 'from-emerald-400 to-teal-500',
    icon: HeartHandshake,
  },
  {
    title: 'Deeper Understanding',
    text: 'Our goal is to help you build a richer understanding of the wonders of psychology.',
    color: 'from-fuchsia-500 to-pink-500',
    icon: Telescope,
  },
]

export function OurMission() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background text-foreground py-12">
      <Seo
        title="Our Mission | Free Psychology Education | Dianoia"
        description="Learn how Dianoia's mission supports free psychology education through accessible online psychology lessons and beginner-friendly courses."
      />
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
            Our purpose
          </p>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Dianoia's Mission
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-200">
            Free psychology education with color, clarity, and room to go deep for
            anyone looking to learn psychology online.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-12 text-white shadow-xl dark:border-cyan-800">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-white/20">
                <Sparkles className="size-7" />
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                A nonprofit built for learners who want more than surface-level answers.
              </h2>
              <p className="text-lg leading-relaxed text-white/90">
                Welcome to Dianoia. Our mission is to create a nonprofit website
                where people can learn many topics in psychology through a reliable,
                well-sourced experience.
              </p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Compass className="size-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Practical, Trustworthy Guidance
              </h3>
              <p className="text-muted-foreground dark:text-emerald-50 leading-relaxed">
                We provide dependable information about career paths, how these
                skills can be applied in everyday life, and how and why these
                subjects came to be.
              </p>
            </section>

            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm dark:border-rose-900 dark:bg-rose-950/40">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-rose-500 text-white">
                <BookOpen className="size-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                History to Modern Practice
              </h3>
              <p className="text-muted-foreground dark:text-rose-50 leading-relaxed">
                Here, we dive deep into the history of each subject, from the
                people who discovered it to how it has evolved into modern
                practice and understanding.
              </p>
            </section>
          </div>

          <section className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 p-10 text-white shadow-lg dark:border-violet-900">
            <h3 className="text-3xl font-bold mb-3">Learning Without Barriers</h3>
            <p className="max-w-3xl text-white/90 leading-relaxed">
              Many platforms offer brief, high-cost courses. But a genuine
              interest in psychology deserves more than a few weeks and a hefty
              price tag.
            </p>
          </section>

          <div className="grid md:grid-cols-3 gap-6">
            {principles.map((item) => {
              const Icon = item.icon
              return (
                <section
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div
                    className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground dark:text-slate-200 leading-relaxed">
                    {item.text}
                  </p>
                </section>
              )
            })}
          </div>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-12 shadow-sm dark:border-amber-900 dark:bg-amber-950/40">
            <h3 className="text-3xl font-bold mb-4">Why Dianoia</h3>
            <p className="text-muted-foreground dark:text-amber-50 leading-relaxed">
              Dianoia is a nonprofit created from the motivation to help others
              discover their interests, a motivation strong enough to guide
              people toward exploring the human mind. By choosing Dianoia, you
              choose access to a dependable and enriching pool of knowledge, in
              a space designed to inspire learning and growth.
            </p>
          </section>

          <section className="rounded-2xl border border-sky-200 bg-sky-50 p-12 shadow-sm dark:border-sky-900 dark:bg-sky-950/40">
            <h3 className="mb-6 text-3xl font-bold">Questions About Our Free Courses</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-lg font-semibold">
                  Why offer free online psychology courses?
                </h4>
                <p className="text-muted-foreground dark:text-sky-50 leading-relaxed">
                  We believe free psychology education makes it easier for curious
                  learners, students, and career explorers to start learning without
                  financial barriers.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-lg font-semibold">
                  Who are Dianoia&apos;s psychology lessons for?
                </h4>
                <p className="text-muted-foreground dark:text-sky-50 leading-relaxed">
                  Our lessons are designed for beginners, independent learners, and
                  anyone who wants an accessible way to study psychology online.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-lg font-semibold">
                  What makes Dianoia different?
                </h4>
                <p className="text-muted-foreground dark:text-sky-50 leading-relaxed">
                  Dianoia combines free psychology courses, structured lessons, quiz
                  practice, and a mission-driven nonprofit approach focused on useful,
                  trustworthy learning.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-lg font-semibold">
                  Can I start with beginner psychology topics?
                </h4>
                <p className="text-muted-foreground dark:text-sky-50 leading-relaxed">
                  Yes. We aim to make introductory psychology approachable, then guide
                  learners into more specialized subjects as their confidence grows.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
