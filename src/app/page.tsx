import Link from "next/link"

const modes = [
  {
    title: "ONLINE MODE",
    description:
      "Online multiplayer competition is currently unavailable and will be added in the next update.",
    href: "",
    available: false,
  },
  {
    title: "TRAINING MODE",
    description:
      "Learn trading from absolute beginner level through advanced and professional-style simulation.",
    href: "/training",
    available: true,
  },
  {
    title: "DEMO ACCOUNT",
    description:
      "Practice with fictional simulated brokers, markets, charts, positions and virtual money.",
    href: "/demo",
    available: true,
  },
  {
    title: "SETTINGS",
    description:
      "Configure your MSA 26 simulation, currency, chart and training preferences.",
    href: "/settings",
    available: true,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            OFFLINE-FIRST TRADING SIMULATOR
          </div>

          <h1 className="text-6xl font-black tracking-tight">
            MSA <span className="text-emerald-400">26</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Learn, practice, simulate and compete in a realistic virtual
            trading environment.
          </p>
        </header>

        {/* Main modes */}
        <section className="grid flex-1 gap-6 sm:grid-cols-2">
          {modes.map((mode) => {
            if (!mode.available) {
              return (
                <div
                  key={mode.title}
                  className="flex min-h-[230px] cursor-not-allowed flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-8 opacity-90"
                >
                  <div>
                    <h2 className="text-2xl font-bold tracking-wide text-slate-300">
                      {mode.title}
                    </h2>

                    <p className="mt-4 max-w-md leading-7 text-slate-400">
                      {mode.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-semibold text-orange-400">
                      AVAILABLE ON NEXT UPDATE
                    </span>

                    <span className="text-2xl text-slate-600">
                      🔒
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={mode.title}
                href={mode.href}
                className="group flex min-h-[230px] flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-slate-900/80"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-wide transition group-hover:text-emerald-400">
                    {mode.title}
                  </h2>

                  <p className="mt-4 max-w-md leading-7 text-slate-400">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    OPEN
                  </span>

                  <span className="text-2xl text-emerald-400 transition group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </Link>
            )
          })}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          MSA 26 uses simulated markets and virtual money for education,
          training and competition.
        </footer>
      </div>
    </main>
  )
}