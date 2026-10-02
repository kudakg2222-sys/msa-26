"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Settings = {
  sound: boolean
  notifications: boolean
  confirmOrders: boolean
  darkMode: boolean
  showGrid: boolean
  autoScrollChart: boolean
  defaultLotSize: number
  defaultLeverage: number
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  notifications: true,
  confirmOrders: true,
  darkMode: true,
  showGrid: true,
  autoScrollChart: true,
  defaultLotSize: 0.01,
  defaultLeverage: 100,
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS)

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored =
      localStorage.getItem("msa26-settings")

    if (!stored) {
      return
    }

    try {
      const parsed =
        JSON.parse(stored)

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      })
    } catch {
      localStorage.removeItem(
        "msa26-settings"
      )
    }
  }, [])

  function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))

    setSaved(false)
  }

  function saveSettings() {
    localStorage.setItem(
      "msa26-settings",
      JSON.stringify(settings)
    )

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS)

    localStorage.setItem(
      "msa26-settings",
      JSON.stringify(DEFAULT_SETTINGS)
    )

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to MSA 26
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-emerald-400">
            MSA 26
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Customize your MSA 26 trading and
            training experience.
          </p>
        </div>

        {/* GENERAL SETTINGS */}

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">
            General
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            General application preferences.
          </p>

          <div className="mt-6 space-y-4">

            <SettingToggle
              title="Sound Effects"
              description="Play sounds for important trading events."
              value={settings.sound}
              onChange={(value) =>
                updateSetting(
                  "sound",
                  value
                )
              }
            />

            <SettingToggle
              title="Notifications"
              description="Show notifications for trading events and account changes."
              value={settings.notifications}
              onChange={(value) =>
                updateSetting(
                  "notifications",
                  value
                )
              }
            />

            <SettingToggle
              title="Confirm Orders"
              description="Ask for confirmation before opening a trade."
              value={settings.confirmOrders}
              onChange={(value) =>
                updateSetting(
                  "confirmOrders",
                  value
                )
              }
            />

            <SettingToggle
              title="Dark Mode"
              description="Use the dark MSA 26 interface."
              value={settings.darkMode}
              onChange={(value) =>
                updateSetting(
                  "darkMode",
                  value
                )
              }
            />

          </div>
        </section>

        {/* CHART SETTINGS */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">
            Chart Settings
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Configure how trading charts behave.
          </p>

          <div className="mt-6 space-y-4">

            <SettingToggle
              title="Show Chart Grid"
              description="Display horizontal and vertical grid lines."
              value={settings.showGrid}
              onChange={(value) =>
                updateSetting(
                  "showGrid",
                  value
                )
              }
            />

            <SettingToggle
              title="Auto Scroll Chart"
              description="Keep the latest market candles visible."
              value={settings.autoScrollChart}
              onChange={(value) =>
                updateSetting(
                  "autoScrollChart",
                  value
                )
              }
            />

          </div>
        </section>

        {/* TRADING SETTINGS */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">
            Trading Defaults
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            These values will be used as default
            settings when entering the demo.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Default Lot Size
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={settings.defaultLotSize}
                onChange={(event) =>
                  updateSetting(
                    "defaultLotSize",
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-500"
              />

              <p className="mt-1 text-xs text-zinc-600">
                Example: 0.01 lots
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Default Leverage
              </label>

              <select
                value={
                  settings.defaultLeverage
                }
                onChange={(event) =>
                  updateSetting(
                    "defaultLeverage",
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              >
                <option value={10}>
                  1:10
                </option>

                <option value={20}>
                  1:20
                </option>

                <option value={30}>
                  1:30
                </option>

                <option value={50}>
                  1:50
                </option>

                <option value={100}>
                  1:100
                </option>

                <option value={200}>
                  1:200
                </option>

                <option value={500}>
                  1:500
                </option>

                <option value={1000}>
                  1:1000
                </option>
              </select>
            </div>

          </div>
        </section>

        {/* ACCOUNT INFORMATION */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">
            MSA 26
          </h2>

          <div className="mt-5 space-y-3">

            <div className="flex justify-between rounded-lg bg-zinc-900 p-4">
              <span className="text-zinc-500">
                Platform
              </span>

              <span className="font-semibold">
                MSA 26
              </span>
            </div>

            <div className="flex justify-between rounded-lg bg-zinc-900 p-4">
              <span className="text-zinc-500">
                Environment
              </span>

              <span className="font-semibold text-emerald-400">
                Demo
              </span>
            </div>

            <div className="flex justify-between rounded-lg bg-zinc-900 p-4">
              <span className="text-zinc-500">
                Trading
              </span>

              <span className="font-semibold">
                Simulated
              </span>
            </div>

          </div>
        </section>

        {/* BUTTONS */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <button
            onClick={saveSettings}
            className="flex-1 rounded-lg bg-emerald-600 px-5 py-3 font-bold transition hover:bg-emerald-500"
          >
            Save Settings
          </button>

          <button
            onClick={resetSettings}
            className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-900"
          >
            Reset Defaults
          </button>

        </div>

        {saved && (
          <div className="mt-4 rounded-lg border border-emerald-900 bg-emerald-950/30 p-4 text-center text-sm text-emerald-400">
            Settings saved successfully.
          </div>
        )}

        <footer className="mt-10 pb-8 text-center text-xs text-zinc-600">
          MSA 26 • Trading Platform Settings
        </footer>

      </div>
    </main>
  )
}

function SettingToggle({
  title,
  description,
  value,
  onChange,
}: {
  title: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!value)
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          value
            ? "bg-emerald-600"
            : "bg-zinc-700"
        }`}
        aria-label={`Toggle ${title}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            value
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </div>
  )
}