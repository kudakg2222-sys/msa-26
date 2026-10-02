"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts"

type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

type Props = {
  scenarioId: string
}

function createScenarioCandles(
  scenarioId: string
): Candle[] {
  const candles: Candle[] = []

  let price = 100

  for (let i = 0; i < 35; i++) {
    let movement = 0

    if (scenarioId === "beginner-bullish-candle") {
      movement =
        i < 10
          ? 0.35
          : i < 20
            ? 0.55
            : 0.4
    } else if (scenarioId === "beginner-bearish-candle") {
      movement =
        i < 10
          ? -0.3
          : i < 20
            ? -0.5
            : -0.4
    } else if (scenarioId === "chart-uptrend") {
      movement =
        i % 6 === 0
          ? -0.15
          : 0.7
    } else if (scenarioId === "chart-downtrend") {
      movement =
        i % 6 === 0
          ? 0.15
          : -0.7
    } else if (scenarioId === "risk-position-size") {
      movement =
        Math.sin(i * 0.8) * 0.35
    } else if (scenarioId === "risk-overtrading") {
      movement =
        Math.sin(i * 0.9) * 0.45
    } else if (scenarioId === "technical-breakout") {
      if (i < 20) {
        movement = Math.sin(i) * 0.2
      } else if (i < 26) {
        movement = 0.15
      } else {
        movement = 1.25
      }
    } else if (scenarioId === "technical-pullback") {
      if (i < 22) {
        movement = 0.65
      } else if (i < 27) {
        movement = -0.8
      } else {
        movement = 0.55
      }
    } else if (scenarioId === "strategy-entry") {
      movement =
        i < 15
          ? 0.15
          : i < 25
            ? 0.5
            : 0.1
    } else if (scenarioId === "strategy-exit") {
      movement =
        i < 24
          ? 0.65
          : -0.35
    } else if (scenarioId === "advanced-confluence") {
      movement =
        i % 7 === 0
          ? 0.1
          : 0.55
    } else if (scenarioId === "professional-independent") {
      movement =
        Math.sin(i * 0.65) * 0.55 +
        (i > 18 ? 0.15 : 0)
    } else {
      movement =
        Math.sin(i * 0.7) * 0.4
    }

    const open = price

    const close = Math.max(
      1,
      open + movement
    )

    const volatility =
      0.25 +
      Math.abs(movement) * 0.35

    const high =
      Math.max(open, close) +
      volatility

    const low =
      Math.min(open, close) -
      volatility

    candles.push({
      time:
        1760000000 +
        i * 300,

      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
    })

    price = close
  }

  return candles
}

function getScenarioLabel(
  scenarioId: string
) {
  switch (scenarioId) {
    case "beginner-bullish-candle":
      return "Bullish Market"

    case "beginner-bearish-candle":
      return "Bearish Market"

    case "chart-uptrend":
      return "Uptrend"

    case "chart-downtrend":
      return "Downtrend"

    case "technical-breakout":
      return "Breakout"

    case "technical-pullback":
      return "Pullback"

    case "risk-position-size":
      return "Market Movement"

    case "risk-overtrading":
      return "Market Movement"

    case "strategy-entry":
      return "Entry Setup"

    case "strategy-exit":
      return "Exit Setup"

    case "advanced-confluence":
      return "Confluence"

    case "professional-independent":
      return "Independent Analysis"

    default:
      return "Simulated Market"
  }
}

export default function TrainingScenarioChart({
  scenarioId,
}: Props) {
  const chartContainerRef =
    useRef<HTMLDivElement | null>(null)

  const chartRef =
    useRef<IChartApi | null>(null)

  const candleSeriesRef =
    useRef<ISeriesApi<"Candlestick"> | null>(null)

  const candles = useMemo(
    () => createScenarioCandles(scenarioId),
    [scenarioId]
  )

  /*
   * Start with only a small portion of the
   * scenario visible.
   *
   * The remaining candles stay hidden until
   * the learner reveals them.
   */
  const [visibleCount, setVisibleCount] =
    useState(8)

  /*
   * When the learner opens another scenario,
   * restart the chart from the beginning.
   */
  useEffect(() => {
    setVisibleCount(8)
  }, [scenarioId])

  const visibleCandles = candles.slice(
    0,
    visibleCount
  )

  const hasMoreCandles =
    visibleCount < candles.length

  useEffect(() => {
    if (!chartContainerRef.current) {
      return
    }

    const chart = createChart(
      chartContainerRef.current,
      {
        width:
          chartContainerRef.current.clientWidth,

        height: 420,

        layout: {
          background: {
            type: ColorType.Solid,
            color: "#020617",
          },

          textColor: "#94a3b8",
        },

        grid: {
          vertLines: {
            color: "#1e293b",
          },

          horzLines: {
            color: "#1e293b",
          },
        },

        rightPriceScale: {
          borderColor: "#334155",
        },

        timeScale: {
          borderColor: "#334155",
          timeVisible: true,
          secondsVisible: false,
        },

        crosshair: {
          vertLine: {
            color: "#64748b",
            width: 1,
            style: 2,
          },

          horzLine: {
            color: "#64748b",
            width: 1,
            style: 2,
          },
        },
      }
    )

    const series = chart.addSeries(
      CandlestickSeries,
      {
        upColor: "#22c55e",
        downColor: "#ef4444",

        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",

        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      }
    )

    chartRef.current = chart
    candleSeriesRef.current = series

    const handleResize = () => {
      if (!chartContainerRef.current) {
        return
      }

      chart.applyOptions({
        width:
          chartContainerRef.current.clientWidth,
      })
    }

    window.addEventListener(
      "resize",
      handleResize
    )

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      )

      chart.remove()

      chartRef.current = null
      candleSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!candleSeriesRef.current) {
      return
    }

    const chartCandles =
      visibleCandles.map<
        CandlestickData<Time>
      >((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))

    if (chartCandles.length === 0) {
      return
    }

    candleSeriesRef.current.setData(
      chartCandles
    )

    chartRef.current
      ?.timeScale()
      .fitContent()
  }, [visibleCandles])

  const revealNextCandle = () => {
    setVisibleCount((current) =>
      Math.min(
        current + 1,
        candles.length
      )
    )
  }

  const resetScenario = () => {
    setVisibleCount(8)
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Scenario Chart
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {getScenarioLabel(scenarioId)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-500">
          Simulated market
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className="w-full overflow-hidden"
      />

      <div className="border-t border-slate-800 bg-slate-950 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">
              Market candles revealed
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {visibleCount} of {candles.length} candles
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetScenario}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={revealNextCandle}
              disabled={!hasMoreCandles}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {hasMoreCandles
                ? "Next Candle"
                : "Scenario Complete"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Analyze the candles that are currently visible.
          Future candles remain hidden until you reveal them.
        </p>
      </div>
    </div>
  )
}