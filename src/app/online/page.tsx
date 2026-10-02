import Link from "next/link"

export default function OnlinePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to MSA 26
        </Link>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm font-semibold text-emerald-400">
            ONLINE MODE
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Virtual Trading Competition
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Every player starts with exactly $200 virtual money. Build your
            simulated account using your own strategy and compete on the
            virtual leaderboard.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-500">Starting Balance</p>
              <p className="mt-2 text-2xl font-bold">$200.00</p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-500">Account Type</p>
              <p className="mt-2 text-2xl font-bold">Virtual</p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-500">Currency</p>
              <p className="mt-2 text-2xl font-bold">USD</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-300">
            Online Mode is a virtual competition. It does not use real-money
            deposits or withdrawals.
          </div>
        </div>
      </div>
    </main>
  )
}