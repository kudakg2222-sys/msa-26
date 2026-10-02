import type { Candle, MarketCategory } from "@/types/trading"

/*
 * ============================================================
 * MSA 26 SIMULATED MARKET ENGINE
 * ============================================================
 *
 * SIMULATION ONLY.
 *
 * Supported timeframes:
 *
 * 1m  = 1 Minute
 * 5m  = 5 Minutes
 * 15m = 15 Minutes
 * 1h  = 1 Hour
 * 1d  = 1 Day
 * 1w  = 1 Week
 * 1mo = 1 Month
 *
 * Every timeframe has its own candle stream.
 *
 * The current candle remains alive for the entire timeframe.
 *
 * Price ticks update:
 *
 *     previous price
 *          ↓
 *     movement engine
 *          ↓
 *     new price
 *          ↓
 *     candle close
 *          ↓
 *     high / low extend
 *
 * HIGH and LOW are based ONLY on prices actually reached.
 *
 * No future candles are revealed.
 * ============================================================
 */

export type Timeframe =
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "1d"
  | "1w"
  | "1mo"

export type TimeframeConfig = {
  label: string
  durationMs: number | null
  historyLength: number
}

export const TIMEFRAME_CONFIG: Record<
  Timeframe,
  TimeframeConfig
> = {
  "1m": {
    label: "1 Minute",
    durationMs: 60_000,
    historyLength: 180,
  },

  "5m": {
    label: "5 Minutes",
    durationMs: 5 * 60_000,
    historyLength: 180,
  },

  "15m": {
    label: "15 Minutes",
    durationMs: 15 * 60_000,
    historyLength: 180,
  },

  "1h": {
    label: "1 Hour",
    durationMs: 60 * 60_000,
    historyLength: 180,
  },

  "1d": {
    label: "1 Day",
    durationMs: 24 * 60 * 60_000,
    historyLength: 180,
  },

  "1w": {
    label: "1 Week",
    durationMs: 7 * 24 * 60 * 60_000,
    historyLength: 156,
  },

  "1mo": {
    label: "1 Month",
    durationMs: null,
    historyLength: 120,
  },
}

/*
 * IMPORTANT:
 * The demo page expects each timeframe to contain:
 *
 * value
 * label
 * shortLabel
 *
 * Do not use "as const" here because it can cause
 * TypeScript to narrow the array too aggressively.
 */

export type TimeframeOption = {
  value: Timeframe
  label: string
  shortLabel: string
}

export const TIMEFRAMES: TimeframeOption[] = [
  {
    value: "1m",
    label: "1 Minute",
    shortLabel: "1m",
  },

  {
    value: "5m",
    label: "5 Minutes",
    shortLabel: "5m",
  },

  {
    value: "15m",
    label: "15 Minutes",
    shortLabel: "15m",
  },

  {
    value: "1h",
    label: "1 Hour",
    shortLabel: "1H",
  },

  {
    value: "1d",
    label: "1 Day",
    shortLabel: "1D",
  },

  {
    value: "1w",
    label: "1 Week",
    shortLabel: "1W",
  },

  {
    value: "1mo",
    label: "1 Month",
    shortLabel: "1M",
  },
]

export type ContinuousMarketState = {
  price: number
  regime: "bull" | "bear" | "range"
  trendStrength: number
  volatility: number
  momentum: number
  randomSeed: number
  candleStartedAt: number

  patternBias: number
  patternStrength: number
  lastPattern?: string
  lastPatternCandleTime?: number

  nfpEventDateKey?: string

  specialShockCooldown?: number
}

export type ContinuousMarket = {
  id: string
  symbol: string
  name: string
  category: MarketCategory
  broker: string
  startingPrice: number
  spread: number

  timeframe: Timeframe

  candles: Candle[]
  state: ContinuousMarketState
}

type PatternResult = {
  name: string
  bias: number
  strength: number
}

/*
 * ============================================================
 * GENERAL HELPERS
 * ============================================================
 */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  )
}

function roundPrice(price: number) {
  if (price >= 1000) {
    return Number(price.toFixed(2))
  }

  if (price >= 100) {
    return Number(price.toFixed(3))
  }

  if (price >= 10) {
    return Number(price.toFixed(4))
  }

  return Number(price.toFixed(5))
}

/*
 * ============================================================
 * RANDOM ENGINE
 * ============================================================
 */

function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value =
      (value * 1664525 +
        1013904223) >>>
      0

    return value / 4294967296
  }
}

function randomBetween(
  random: () => number,
  min: number,
  max: number
) {
  return (
    min +
    random() *
      (max - min)
  )
}

/*
 * ============================================================
 * TIMEFRAME ENGINE
 * ============================================================
 */

export function getTimeframeBucket(
  timestamp: number,
  timeframe: Timeframe
) {
  const config =
    TIMEFRAME_CONFIG[timeframe]

  if (config.durationMs) {
    return (
      Math.floor(
        timestamp /
          config.durationMs
      ) *
      config.durationMs
    )
  }

  /*
   * Monthly candles start on the first day
   * of the local calendar month.
   */
  const date =
    new Date(timestamp)

  date.setDate(1)
  date.setHours(
    0,
    0,
    0,
    0
  )

  return date.getTime()
}

export function getNextTimeframeStart(
  timestamp: number,
  timeframe: Timeframe
) {
  const config =
    TIMEFRAME_CONFIG[timeframe]

  if (config.durationMs) {
    return (
      timestamp +
      config.durationMs
    )
  }

  const date =
    new Date(timestamp)

  date.setMonth(
    date.getMonth() + 1
  )

  return date.getTime()
}

function getPreviousTimeframeStart(
  timestamp: number,
  timeframe: Timeframe
) {
  const config =
    TIMEFRAME_CONFIG[timeframe]

  if (config.durationMs) {
    return (
      timestamp -
      config.durationMs
    )
  }

  const date =
    new Date(timestamp)

  date.setMonth(
    date.getMonth() - 1
  )

  return date.getTime()
}

function getTimeframeHistoryLength(
  timeframe: Timeframe
) {
  return TIMEFRAME_CONFIG[
    timeframe
  ].historyLength
}

/*
 * ============================================================
 * HISTORICAL MOVEMENT SCALE
 * ============================================================
 */

function getHistoricalMovementScale(
  timeframe: Timeframe
) {
  switch (timeframe) {
    case "1m":
      return 1

    case "5m":
      return 1.8

    case "15m":
      return 2.7

    case "1h":
      return 4

    case "1d":
      return 7

    case "1w":
      return 12

    case "1mo":
      return 18

    default:
      return 1
  }
}

/*
 * ============================================================
 * TIMEFRAME SEEDS
 * ============================================================
 */

function getTimeframeSeedOffset(
  timeframe: Timeframe
) {
  switch (timeframe) {
    case "1m":
      return 101

    case "5m":
      return 5_005

    case "15m":
      return 15_015

    case "1h":
      return 60_060

    case "1d":
      return 144_144

    case "1w":
      return 1_008_008

    case "1mo":
      return 12_012_012

    default:
      return 101
  }
}

/*
 * ============================================================
 * CANDLE HELPERS
 * ============================================================
 */

function getDirection(
  candle: Candle
) {
  if (
    candle.close >
    candle.open
  ) {
    return 1
  }

  if (
    candle.close <
    candle.open
  ) {
    return -1
  }

  return 0
}

function candleBody(
  candle: Candle
) {
  return Math.abs(
    candle.close -
      candle.open
  )
}

function candleRange(
  candle: Candle
) {
  return Math.max(
    candle.high -
      candle.low,
    Number.EPSILON
  )
}

function upperWick(
  candle: Candle
) {
  return (
    candle.high -
    Math.max(
      candle.open,
      candle.close
    )
  )
}

function lowerWick(
  candle: Candle
) {
  return (
    Math.min(
      candle.open,
      candle.close
    ) -
    candle.low
  )
}

function isBullish(
  candle: Candle
) {
  return (
    candle.close >
    candle.open
  )
}

function isBearish(
  candle: Candle
) {
  return (
    candle.close <
    candle.open
  )
}

function isDoji(
  candle: Candle
) {
  return (
    candleBody(candle) <=
    candleRange(candle) *
      0.12
  )
}

function isSmallBody(
  candle: Candle
) {
  return (
    candleBody(candle) <=
    candleRange(candle) *
      0.35
  )
}

function isLargeBody(
  candle: Candle
) {
  return (
    candleBody(candle) >=
    candleRange(candle) *
      0.55
  )
}

function isMarubozu(
  candle: Candle
) {
  return (
    candleBody(candle) >=
    candleRange(candle) *
      0.8
  )
}

function isSpinningTop(
  candle: Candle
) {
  const range =
    candleRange(candle)

  const body =
    candleBody(candle)

  return (
    body <= range * 0.35 &&
    upperWick(candle) >=
      range * 0.2 &&
    lowerWick(candle) >=
      range * 0.2
  )
}

/*
 * ============================================================
 * TREND
 * ============================================================
 */

function getRecentTrend(
  candles: Candle[]
) {
  if (
    candles.length < 6
  ) {
    return 0
  }

  const recent =
    candles.slice(-6)

  const first =
    recent[0].close

  const last =
    recent[
      recent.length - 1
    ].close

  if (first === 0) {
    return 0
  }

  return clamp(
    ((last - first) /
      first) /
      0.003,
    -1,
    1
  )
}

function getTrendSignal(
  candles: Candle[]
) {
  if (
    candles.length < 12
  ) {
    return 0
  }

  const recent =
    candles.slice(-12)

  const first =
    recent[0].close

  const last =
    recent[
      recent.length - 1
    ].close

  if (first === 0) {
    return 0
  }

  return clamp(
    ((last - first) /
      first) /
      0.004,
    -1,
    1
  )
}

function getMomentumSignal(
  candles: Candle[]
) {
  if (
    candles.length < 8
  ) {
    return 0
  }

  const recent =
    candles.slice(-8)

  let weightedMovement = 0
  let totalWeight = 0

  for (
    let i = 1;
    i < recent.length;
    i++
  ) {
    const previous =
      recent[i - 1].close

    const current =
      recent[i].close

    if (
      previous === 0
    ) {
      continue
    }

    const weight = i

    weightedMovement +=
      ((current -
        previous) /
        previous) *
      weight

    totalWeight += weight
  }

  if (
    totalWeight === 0
  ) {
    return 0
  }

  return clamp(
    (weightedMovement /
      totalWeight) /
      0.0015,
    -1,
    1
  )
}

/*
 * ============================================================
 * SUPPORT / RESISTANCE
 * ============================================================
 */

function getSupportResistanceSignal(
  candles: Candle[]
) {
  if (
    candles.length < 15
  ) {
    return 0
  }

  const recent =
    candles.slice(-15)

  const current =
    recent[
      recent.length - 1
    ].close

  if (
    current <= 0
  ) {
    return 0
  }

  const highs =
    recent.map(
      (candle) =>
        candle.high
    )

  const lows =
    recent.map(
      (candle) =>
        candle.low
    )

  const resistance =
    Math.max(...highs)

  const support =
    Math.min(...lows)

  if (
    resistance <= support
  ) {
    return 0
  }

  const distanceToResistance =
    (resistance -
      current) /
    current

  const distanceToSupport =
    (current -
      support) /
    current

  let signal = 0

  if (
    distanceToResistance <
    0.0015
  ) {
    signal -= 0.25
  }

  if (
    distanceToSupport <
    0.0015
  ) {
    signal += 0.25
  }

  return signal
}

/*
 * ============================================================
 * CANDLE PATTERN DETECTION
 * ============================================================
 */

function detectCandlePattern(
  candles: Candle[]
): PatternResult | null {
  if (
    candles.length < 2
  ) {
    return null
  }

  const a =
    candles[
      candles.length - 1
    ]

  const b =
    candles[
      candles.length - 2
    ]

  const trend =
    getRecentTrend(candles)

  /*
   * THREE-CANDLE PATTERNS
   */

  if (
    candles.length >= 3
  ) {
    const c =
      candles[
        candles.length - 3
      ]

    const cBody =
      candleBody(c)

    const bBody =
      candleBody(b)

    if (
      isBearish(c) &&
      cBody >=
        candleRange(c) *
          0.45 &&
      bBody <=
        candleRange(b) *
          0.3 &&
      isBullish(a) &&
      a.close >
        c.open -
          cBody * 0.5
    ) {
      return {
        name: "Morning Star",
        bias: 1,
        strength: 0.8,
      }
    }

    if (
      isBullish(c) &&
      cBody >=
        candleRange(c) *
          0.45 &&
      bBody <=
        candleRange(b) *
          0.3 &&
      isBearish(a) &&
      a.close <
        c.open +
          cBody * 0.5
    ) {
      return {
        name: "Evening Star",
        bias: -1,
        strength: 0.8,
      }
    }

    if (
      isBullish(c) &&
      isBullish(b) &&
      isBullish(a) &&
      isLargeBody(c) &&
      isLargeBody(b) &&
      isLargeBody(a) &&
      b.close > c.close &&
      a.close > b.close
    ) {
      return {
        name: "Three White Soldiers",
        bias: 1,
        strength: 0.75,
      }
    }

    if (
      isBearish(c) &&
      isBearish(b) &&
      isBearish(a) &&
      isLargeBody(c) &&
      isLargeBody(b) &&
      isLargeBody(a) &&
      b.close < c.close &&
      a.close < b.close
    ) {
      return {
        name: "Three Black Crows",
        bias: -1,
        strength: 0.75,
      }
    }
  }

  /*
   * TWO-CANDLE PATTERNS
   */

  const previousBodyHigh =
    Math.max(
      b.open,
      b.close
    )

  const previousBodyLow =
    Math.min(
      b.open,
      b.close
    )

  const currentBodyHigh =
    Math.max(
      a.open,
      a.close
    )

  const currentBodyLow =
    Math.min(
      a.open,
      a.close
    )

  if (
    isBearish(b) &&
    isBullish(a) &&
    currentBodyHigh >=
      previousBodyHigh &&
    currentBodyLow <=
      previousBodyLow &&
    candleBody(a) >=
      candleBody(b) * 0.9
  ) {
    return {
      name: "Bullish Engulfing",
      bias: 1,
      strength: 0.75,
    }
  }

  if (
    isBullish(b) &&
    isBearish(a) &&
    currentBodyHigh >=
      previousBodyHigh &&
    currentBodyLow <=
      previousBodyLow &&
    candleBody(a) >=
      candleBody(b) * 0.9
  ) {
    return {
      name: "Bearish Engulfing",
      bias: -1,
      strength: 0.75,
    }
  }

  if (
    isBearish(b) &&
    isBullish(a) &&
    currentBodyHigh <
      previousBodyHigh &&
    currentBodyLow >
      previousBodyLow
  ) {
    return {
      name: "Bullish Harami",
      bias: 1,
      strength: 0.55,
    }
  }

  if (
    isBullish(b) &&
    isBearish(a) &&
    currentBodyHigh <
      previousBodyHigh &&
    currentBodyLow >
      previousBodyLow
  ) {
    return {
      name: "Bearish Harami",
      bias: -1,
      strength: 0.55,
    }
  }

  if (
    isBearish(b) &&
    isBullish(a) &&
    a.open <= b.close &&
    a.close >
      b.open -
        candleBody(b) *
          0.5 &&
    a.close < b.open
  ) {
    return {
      name: "Piercing Line",
      bias: 1,
      strength: 0.6,
    }
  }

  if (
    isBullish(b) &&
    isBearish(a) &&
    a.open >= b.close &&
    a.close <
      b.open +
        candleBody(b) *
          0.5 &&
    a.close > b.open
  ) {
    return {
      name: "Dark Cloud Cover",
      bias: -1,
      strength: 0.6,
    }
  }

  const bottomDifference =
    Math.abs(
      a.low - b.low
    )

  if (
    isBearish(b) &&
    isBullish(a) &&
    bottomDifference <=
      candleRange(a) *
        0.08
  ) {
    return {
      name: "Tweezer Bottom",
      bias: 1,
      strength: 0.55,
    }
  }

  const topDifference =
    Math.abs(
      a.high - b.high
    )

  if (
    isBullish(b) &&
    isBearish(a) &&
    topDifference <=
      candleRange(a) *
        0.08
  ) {
    return {
      name: "Tweezer Top",
      bias: -1,
      strength: 0.55,
    }
  }

  if (
    a.high < b.high &&
    a.low > b.low
  ) {
    return {
      name: "Inside Bar",
      bias: 0,
      strength: 0.25,
    }
  }

  if (
    a.high > b.high &&
    a.low < b.low
  ) {
    const direction =
      getDirection(a)

    return {
      name: "Outside Bar",
      bias: direction,
      strength:
        direction === 0
          ? 0.2
          : 0.5,
    }
  }

  /*
   * ONE-CANDLE PATTERNS
   */

  const range =
    candleRange(a)

  const body =
    candleBody(a)

  const upper =
    upperWick(a)

  const lower =
    lowerWick(a)

  const bodyTop =
    Math.max(
      a.open,
      a.close
    )

  const bodyBottom =
    Math.min(
      a.open,
      a.close
    )

  const bodyPositionFromLow =
    (bodyBottom -
      a.low) /
    range

  const bodyPositionFromHigh =
    (a.high -
      bodyTop) /
    range

  if (
    trend > 0.25 &&
    lower >=
      Math.max(
        body * 2.2,
        range * 0.45
      ) &&
    upper <=
      range * 0.25 &&
    bodyPositionFromLow >=
      0.55
  ) {
    return {
      name: "Hanging Man",
      bias: -1,
      strength: 0.6,
    }
  }

  if (
    lower >=
      Math.max(
        body * 2.2,
        range * 0.45
      ) &&
    upper <=
      range * 0.25 &&
    bodyPositionFromLow >=
      0.55
  ) {
    return {
      name: "Hammer",
      bias:
        trend <= 0
          ? 1
          : 0,
      strength:
        trend <= 0
          ? 0.65
          : 0.2,
    }
  }

  if (
    trend > 0.25 &&
    upper >=
      Math.max(
        body * 2.2,
        range * 0.45
      ) &&
    lower <=
      range * 0.25 &&
    bodyPositionFromHigh >=
      0.55
  ) {
    return {
      name: "Shooting Star",
      bias: -1,
      strength: 0.65,
    }
  }

  if (
    upper >=
      Math.max(
        body * 2.2,
        range * 0.45
      ) &&
    lower <=
      range * 0.25 &&
    bodyPositionFromHigh >=
      0.55
  ) {
    return {
      name: "Inverted Hammer",
      bias:
        trend <= 0
          ? 1
          : 0,
      strength:
        trend <= 0
          ? 0.6
          : 0.2,
    }
  }

  if (
    isBullish(a) &&
    isMarubozu(a)
  ) {
    return {
      name: "Bullish Marubozu",
      bias: 1,
      strength: 0.55,
    }
  }

  if (
    isBearish(a) &&
    isMarubozu(a)
  ) {
    return {
      name: "Bearish Marubozu",
      bias: -1,
      strength: 0.55,
    }
  }

  if (
    isDoji(a)
  ) {
    return {
      name: "Doji",
      bias: 0,
      strength: 0.35,
    }
  }

  if (
    isSpinningTop(a)
  ) {
    return {
      name: "Spinning Top",
      bias: 0,
      strength: 0.25,
    }
  }

  if (
    isSmallBody(a)
  ) {
    return null
  }

  return null
}

/*
 * ============================================================
 * PATTERN SIGNAL
 * ============================================================
 */

function getPatternSignal(
  candles: Candle[]
) {
  const pattern =
    detectCandlePattern(
      candles
    )

  if (!pattern) {
    return {
      bias: 0,
      strength: 0,
      name:
        undefined as
          | string
          | undefined,
    }
  }

  return pattern
}

/*
 * ============================================================
 * NORMAL MARKET MOVEMENT
 * ============================================================
 */

function getNormalMarketMovement(
  market: ContinuousMarket,
  random: () => number
) {
  const completed =
    market.candles.slice(0, -1)

  const trend =
    getTrendSignal(
      completed
    )

  const momentum =
    getMomentumSignal(
      completed
    )

  const supportResistance =
    getSupportResistanceSignal(
      completed
    )

  const patternComponent =
    market.state.patternBias *
    market.state.patternStrength *
    0.12

  let regimeComponent = 0

  if (
    market.state.regime ===
    "bull"
  ) {
    regimeComponent = 0.065
  }

  if (
    market.state.regime ===
    "bear"
  ) {
    regimeComponent = -0.065
  }

  const trendComponent =
    trend *
    market.state.trendStrength *
    0.13

  const momentumComponent =
    momentum * 0.14

  const supportResistanceComponent =
    supportResistance * 0.08

  const meanReversion =
    -trend * 0.06

  const randomNoise =
    randomBetween(
      random,
      -1,
      1
    ) * 0.95

  const microNoise =
    randomBetween(
      random,
      -1,
      1
    ) * 0.45

  let impulse = 0

  if (
    random() < 0.075
  ) {
    impulse =
      randomBetween(
        random,
        -0.75,
        0.75
      )
  }

  const signal =
    trendComponent +
    momentumComponent +
    patternComponent +
    regimeComponent +
    supportResistanceComponent +
    meanReversion +
    randomNoise +
    microNoise +
    impulse

  let timeframeFactor = 0.12

  switch (market.timeframe) {
    case "1m":
      timeframeFactor = 0.12
      break

    case "5m":
      timeframeFactor = 0.08
      break

    case "15m":
      timeframeFactor = 0.061
      break

    case "1h":
      timeframeFactor = 0.043
      break

    case "1d":
      timeframeFactor = 0.024
      break

    case "1w":
      timeframeFactor = 0.013
      break

    case "1mo":
      timeframeFactor = 0.009
      break

    default:
      timeframeFactor = 0.12
  }

  const tickMovement =
    signal *
    market.state.volatility *
    timeframeFactor

  return clamp(
    tickMovement,
    -0.0018,
    0.0018
  )
}

/*
 * ============================================================
 * MARKET-SPECIFIC MOVEMENT
 * ============================================================
 */

function getKgSyntheticMovement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1
  )
}

function getVolatility10Movement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.25
  )
}

function getVolatility25Movement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.55
  )
}

function getVolatility50Movement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.85
  )
}

/*
 * ============================================================
 * BOOM SIMULATION
 * ============================================================
 */

function getBoomMovement(
  market: ContinuousMarket,
  random: () => number,
  spikeChance: number
) {
  let movement =
    getNormalMarketMovement(
      market,
      random
    ) * 0.90

  if (
    random() <
    spikeChance
  ) {
    const direction =
      random() > 0.28
        ? 1
        : -1

    const spike =
      randomBetween(
        random,
        0.0012,
        0.0045
      ) * direction

    movement += spike

    market.state.specialShockCooldown =
      4
  }

  if (
    market.state
      .specialShockCooldown &&
    market.state
      .specialShockCooldown > 0
  ) {
    market.state.specialShockCooldown -= 1
  }

  return clamp(
    movement,
    -0.0045,
    0.0045
  )
}

function getBitcoinMovement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.55
  )
}

function getEthereumMovement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.45
  )
}

/*
 * Forex movement.
 *
 * Used by:
 * EUR/USD
 * GBP/USD
 * USD/JPY
 * ZIG/USD
 *
 * All are simulated markets.
 */

function getForexMovement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.05
  )
}

function getGoldMovement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.10
  )
}

function getIndexMovement(
  market: ContinuousMarket,
  random: () => number
) {
  return (
    getNormalMarketMovement(
      market,
      random
    ) * 1.05
  )
}

/*
 * ============================================================
 * SIMULATED NFP ENGINE
 * ============================================================
 *
 * 13:30 - 13:35 = release
 * 13:35 - 13:40 = cooling
 *
 * SIMULATION ONLY.
 * ============================================================
 */

function getNfpMovement(
  market: ContinuousMarket,
  random: () => number
) {
  const status =
    getNfpEventStatus()

  if (!status.active) {
    return (
      getNormalMarketMovement(
        market,
        random
      ) * 0.7
    )
  }

  const shockDirection =
    random() > 0.5
      ? 1
      : -1

  const shock =
    randomBetween(
      random,
      0.0006,
      0.004
    ) * shockDirection

  const normal =
    getNormalMarketMovement(
      market,
      random
    ) * 2

  return clamp(
    normal + shock,
    -0.008,
    0.008
  )
}

/*
 * ============================================================
 * MASTER MOVEMENT ROUTER
 * ============================================================
 */

function getMarketMovement(
  market: ContinuousMarket,
  random: () => number
) {
  switch (market.id) {
    case "kg-synthetic-100":
      return getKgSyntheticMovement(
        market,
        random
      )

    case "kg-volatility-10":
      return getVolatility10Movement(
        market,
        random
      )

    case "kg-volatility-25":
      return getVolatility25Movement(
        market,
        random
      )

    case "kg-volatility-50":
      return getVolatility50Movement(
        market,
        random
      )

    case "kg-boom-300":
      return getBoomMovement(
        market,
        random,
        0.018
      )

    case "kg-boom-500":
      return getBoomMovement(
        market,
        random,
        0.014
      )

    case "kg-boom-1000":
      return getBoomMovement(
        market,
        random,
        0.010
      )

    case "kg-btc":
      return getBitcoinMovement(
        market,
        random
      )

    case "kg-eth":
      return getEthereumMovement(
        market,
        random
      )

    case "kg-eurusd":
    case "kg-gbpusd":
    case "kg-usdjpy":
    case "kg-zigusd":
      return getForexMovement(
        market,
        random
      )

    case "kg-xauusd":
      return getGoldMovement(
        market,
        random
      )

    case "kg-index":
      return getIndexMovement(
        market,
        random
      )

    case "kg-nfp-1":
      return getNfpMovement(
        market,
        random
      )

    default:
      return getNormalMarketMovement(
        market,
        random
      )
  }
}

/*
 * ============================================================
 * NFP TIME
 * ============================================================
 */

function getLocalDateKey(
  timestamp: number
) {
  const date =
    new Date(timestamp)

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-")
}

export function getNfpEventStatus(
  timestamp = Date.now()
) {
  const date =
    new Date(timestamp)

  const eventStart =
    new Date(date)

  eventStart.setHours(
    13,
    30,
    0,
    0
  )

  const eventEnd =
    new Date(date)

  eventEnd.setHours(
    13,
    40,
    0,
    0
  )

  const firstPhaseEnd =
    new Date(date)

  firstPhaseEnd.setHours(
    13,
    35,
    0,
    0
  )

  const active =
    timestamp >=
      eventStart.getTime() &&
    timestamp <
      eventEnd.getTime()

  let phase:
    | "before"
    | "release"
    | "cooling" =
    "before"

  if (
    timestamp >=
      eventStart.getTime() &&
    timestamp <
      firstPhaseEnd.getTime()
  ) {
    phase = "release"
  } else if (
    timestamp >=
      firstPhaseEnd.getTime() &&
    timestamp <
      eventEnd.getTime()
  ) {
    phase = "cooling"
  }

  return {
    active,
    phase,

    eventStart:
      eventStart.getTime(),

    eventEnd:
      eventEnd.getTime(),

    dateKey:
      getLocalDateKey(
        timestamp
      ),
  }
}

/*
 * ============================================================
 * INITIAL MARKET STATE
 * ============================================================
 */

function createInitialState(
  startingPrice: number,
  seed: number,
  candleStartedAt: number,
  volatility: number
): ContinuousMarketState {
  const random =
    createRandom(seed)

  const roll =
    random()

  let regime:
    | "bull"
    | "bear"
    | "range"

  if (
    roll < 0.25
  ) {
    regime = "bull"
  } else if (
    roll < 0.5
  ) {
    regime = "bear"
  } else {
    regime = "range"
  }

  return {
    price:
      startingPrice,

    regime,

    trendStrength:
      0.20 +
      random() * 0.45,

    volatility,

    momentum:
      (random() - 0.5) *
      0.25,

    randomSeed:
      seed,

    candleStartedAt,

    patternBias: 0,

    patternStrength: 0,

    lastPattern:
      undefined,

    lastPatternCandleTime:
      undefined,

    nfpEventDateKey:
      undefined,

    specialShockCooldown:
      0,
  }
}

/*
 * ============================================================
 * HISTORICAL CANDLE CREATION
 * ============================================================
 */

function createBaseCandle(
  price: number,
  time: number,
  random: () => number,
  volatility: number,
  movement = 0
): Candle {
  const open =
    roundPrice(price)

  const randomComponent =
    (random() - 0.5) *
    volatility *
    2.8

  const totalMovement =
    movement +
    randomComponent

  const close =
    Math.max(
      Number.EPSILON,
      open +
        open *
          totalMovement
    )

  const wickSize =
    open *
    volatility *
    (1 +
      random() * 2.2)

  const high =
    Math.max(
      open,
      close
    ) +
    wickSize *
      random()

  const low =
    Math.max(
      Number.EPSILON,
      Math.min(
        open,
        close
      ) -
        wickSize *
          random()
    )

  return {
    id: time,
    time,

    open:
      roundPrice(open),

    high:
      roundPrice(high),

    low:
      roundPrice(low),

    close:
      roundPrice(close),

    volume:
      Math.round(
        1000 +
          random() * 9000
      ),
  }
}

/*
 * ============================================================
 * HISTORICAL PATTERN CANDLES
 * ============================================================
 */

function createPatternCandle(
  previous: Candle,
  time: number,
  pattern:
    | "bullish-engulfing"
    | "bearish-engulfing"
    | "bullish-harami"
    | "bearish-harami"
    | "hammer"
    | "shooting-star",
  random: () => number
): Candle {
  const price =
    previous.close

  const range =
    Math.max(
      price * 0.0008,
      Math.abs(
        previous.close -
          previous.open
      ) * 1.15
    )

  if (
    pattern ===
    "bullish-engulfing"
  ) {
    const previousHigh =
      Math.max(
        previous.open,
        previous.close
      )

    const previousLow =
      Math.min(
        previous.open,
        previous.close
      )

    const open =
      previousLow -
      range * 0.05

    const close =
      previousHigh +
      range *
        (0.25 +
          random() * 0.3)

    return {
      id: time,
      time,

      open:
        roundPrice(open),

      high:
        roundPrice(
          close +
            range *
              (0.1 +
                random() *
                  0.15)
        ),

      low:
        roundPrice(
          open -
            range *
              (0.05 +
                random() *
                  0.08)
        ),

      close:
        roundPrice(close),

      volume:
        Math.round(
          5000 +
            random() * 5000
        ),
    }
  }

  if (
    pattern ===
    "bearish-engulfing"
  ) {
    const previousHigh =
      Math.max(
        previous.open,
        previous.close
      )

    const previousLow =
      Math.min(
        previous.open,
        previous.close
      )

    const open =
      previousHigh +
      range * 0.05

    const close =
      previousLow -
      range *
        (0.25 +
          random() * 0.3)

    return {
      id: time,
      time,

      open:
        roundPrice(open),

      high:
        roundPrice(
          open +
            range *
              (0.05 +
                random() *
                  0.08)
        ),

      low:
        roundPrice(
          close -
            range *
              (0.1 +
                random() *
                  0.15)
        ),

      close:
        roundPrice(close),

      volume:
        Math.round(
          5000 +
            random() * 5000
        ),
    }
  }

  if (
    pattern ===
    "bullish-harami"
  ) {
    const previousMid =
      (previous.open +
        previous.close) /
      2

    const body =
      range *
      (0.18 +
        random() * 0.12)

    const open =
      previousMid -
      body * 0.5

    const close =
      previousMid +
      body * 0.5

    return {
      id: time,
      time,

      open:
        roundPrice(open),

      high:
        roundPrice(
          Math.max(
            open,
            close
          ) +
            range * 0.15
        ),

      low:
        roundPrice(
          Math.min(
            open,
            close
          ) -
            range * 0.15
        ),

      close:
        roundPrice(close),

      volume:
        Math.round(
          2500 +
            random() * 2500
        ),
    }
  }

  if (
    pattern ===
    "bearish-harami"
  ) {
    const previousMid =
      (previous.open +
        previous.close) /
      2

    const body =
      range *
      (0.18 +
        random() * 0.12)

    const open =
      previousMid +
      body * 0.5

    const close =
      previousMid -
      body * 0.5

    return {
      id: time,
      time,

      open:
        roundPrice(open),

      high:
        roundPrice(
          Math.max(
            open,
            close
          ) +
            range * 0.15
        ),

      low:
        roundPrice(
          Math.min(
            open,
            close
          ) -
            range * 0.15
        ),

      close:
        roundPrice(close),

      volume:
        Math.round(
          2500 +
            random() * 2500
        ),
    }
  }

  if (
    pattern === "hammer"
  ) {
    const body =
      range * 0.25

    const open =
      price

    const close =
      price +
      body * 0.25

    return {
      id: time,
      time,

      open:
        roundPrice(open),

      high:
        roundPrice(
          close +
            range * 0.08
        ),

      low:
        roundPrice(
          price -
            range * 1.2
        ),

      close:
        roundPrice(close),

      volume:
        Math.round(
          3500 +
            random() * 3500
        ),
    }
  }

  const body =
    range * 0.25

  const open =
    price

  const close =
    price -
    body * 0.25

  return {
    id: time,
    time,

    open:
      roundPrice(open),

    high:
      roundPrice(
        price +
          range * 1.2
      ),

    low:
      roundPrice(
        close -
          range * 0.08
      ),

    close:
      roundPrice(close),

    volume:
      Math.round(
        3500 +
          random() * 3500
      ),
  }
}

/*
 * ============================================================
 * HISTORICAL MARKET
 * ============================================================
 */

function buildHistoricalCandles(
  startingPrice: number,
  seed: number,
  startTime: number,
  volatility: number,
  timeframe: Timeframe
) {
  const random =
    createRandom(seed)

  const candles: Candle[] =
    []

  let price =
    startingPrice

  let localBias = 0

  const movementScale =
    getHistoricalMovementScale(
      timeframe
    )

  const historyLength =
    getTimeframeHistoryLength(
      timeframe
    )

  let time =
    startTime

  for (
    let i = 0;
    i < historyLength;
    i++
  ) {
    if (
      i > 0
    ) {
      time =
        getNextTimeframeStart(
          time,
          timeframe
        )
    }

    if (
      i === 0 ||
      i %
        (
          8 +
          Math.floor(
            random() * 12
          )
        ) ===
        0
    ) {
      localBias =
        (random() - 0.5) *
        volatility *
        2.2 *
        Math.min(
          movementScale,
          4
        )
    }

    localBias *=
      0.94

    const movement =
      localBias +
      (random() - 0.5) *
        volatility *
        2.2 *
        movementScale

    let candle =
      createBaseCandle(
        price,
        time,
        random,
        volatility *
          Math.min(
            movementScale,
            4
          ),
        movement
      )

    if (
      i > 8 &&
      random() < 0.035
    ) {
      const patternPool: Array<
        | "bullish-engulfing"
        | "bearish-engulfing"
        | "bullish-harami"
        | "bearish-harami"
        | "hammer"
        | "shooting-star"
      > = [
        "bullish-engulfing",
        "bearish-engulfing",
        "bullish-harami",
        "bearish-harami",
        "hammer",
        "shooting-star",
      ]

      const pattern =
        patternPool[
          Math.floor(
            random() *
              patternPool.length
          )
        ]

      const previous =
        candles[
          candles.length - 1
        ]

      if (previous) {
        candle =
          createPatternCandle(
            previous,
            time,
            pattern,
            random
          )
      }
    }

    candles.push(
      candle
    )

    price =
      candle.close
  }

  return candles
}

/*
 * ============================================================
 * PATTERN STATE
 * ============================================================
 */

function updatePatternState(
  market: ContinuousMarket
) {
  const completed =
    market.candles.slice(0, -1)

  if (
    completed.length < 2
  ) {
    return
  }

  const latestCompleted =
    completed[
      completed.length - 1
    ]

  if (
    market.state
      .lastPatternCandleTime ===
    latestCompleted.time
  ) {
    return
  }

  const pattern =
    getPatternSignal(
      completed
    )

  market.state
    .lastPatternCandleTime =
    latestCompleted.time

  if (
    pattern.name
  ) {
    market.state.lastPattern =
      pattern.name

    market.state.patternBias =
      pattern.bias

    market.state.patternStrength =
      pattern.strength
  } else {
    market.state.patternStrength *=
      0.55

    if (
      market.state
        .patternStrength < 0.05
    ) {
      market.state.patternStrength =
        0

      market.state.patternBias =
        0

      market.state.lastPattern =
        undefined
    }
  }
}

/*
 * ============================================================
 * LIVE MARKET TICK
 * ============================================================
 */

function updateMarketTick(
  market: ContinuousMarket,
  timestamp: number
) {
  const random =
    createRandom(
      market.state.randomSeed
    )

  market.state.randomSeed =
    (
      market.state.randomSeed +
      7919
    ) >>> 0

  const current =
    market.candles[
      market.candles.length - 1
    ]

  if (!current) {
    return
  }

  const previousPrice =
    current.close

  const movement =
    getMarketMovement(
      market,
      random
    )

  const priceMove =
    previousPrice *
    movement

  const newPrice =
    Math.max(
      Number.EPSILON,
      previousPrice +
        priceMove
    )

  const newClose =
    roundPrice(
      newPrice
    )

  /*
   * HIGH only moves upward when the price
   * actually reaches a new high.
   */
  current.high =
    roundPrice(
      Math.max(
        current.high,
        current.open,
        newClose
      )
    )

  /*
   * LOW only moves downward when the price
   * actually reaches a new low.
   */
  current.low =
    roundPrice(
      Math.max(
        Number.EPSILON,
        Math.min(
          current.low,
          current.open,
          newClose
        )
      )
    )

  /*
   * CLOSE is the latest actual price.
   */
  current.close =
    newClose

  /*
   * OHLC protection.
   */
  current.high =
    roundPrice(
      Math.max(
        current.high,
        current.open,
        current.close
      )
    )

  current.low =
    roundPrice(
      Math.max(
        Number.EPSILON,
        Math.min(
          current.low,
          current.open,
          current.close
        )
      )
    )

  /*
   * Tick volume.
   */
  current.volume +=
    Math.round(
      10 +
        random() * 90
    )

  market.state.price =
    current.close

  /*
   * Pattern influence fades.
   */
  market.state.patternStrength *=
    0.992

  if (
    market.state.patternStrength <
    0.015
  ) {
    market.state.patternStrength =
      0

    market.state.patternBias =
      0
  }

  /*
   * Momentum memory.
   */
  market.state.momentum =
    clamp(
      market.state.momentum *
        0.84 +
        movement *
          120,
      -1,
      1
    )

  /*
   * Occasionally change broader regime.
   */
  if (
    random() < 0.0035
  ) {
    const roll =
      random()

    if (
      roll < 0.30
    ) {
      market.state.regime =
        "bull"
    } else if (
      roll < 0.60
    ) {
      market.state.regime =
        "bear"
    } else {
      market.state.regime =
        "range"
    }

    market.state.trendStrength =
      0.15 +
      random() * 0.45
  }

  /*
   * Slowly vary volatility.
   */
  market.state.volatility =
    clamp(
      market.state.volatility *
        (
          0.985 +
          random() * 0.03
        ),
      0.00018,
      0.0020
    )

  void timestamp
}

/*
 * ============================================================
 * CLOSE CURRENT CANDLE
 * ============================================================
 */

function closeAndStartNextCandle(
  market: ContinuousMarket,
  nextStartTime: number
) {
  const current =
    market.candles[
      market.candles.length - 1
    ]

  if (!current) {
    return
  }

  current.close =
    roundPrice(
      current.close
    )

  current.high =
    roundPrice(
      Math.max(
        current.high,
        current.open,
        current.close
      )
    )

  current.low =
    roundPrice(
      Math.max(
        Number.EPSILON,
        Math.min(
          current.low,
          current.open,
          current.close
        )
      )
    )

  /*
   * Analyze only after candle closes.
   */
  updatePatternState(
    market
  )

  /*
   * New candle opens exactly at previous close.
   */
  const nextCandle: Candle = {
    id: nextStartTime,

    time: nextStartTime,

    open:
      current.close,

    high:
      current.close,

    low:
      current.close,

    close:
      current.close,

    volume: 0,
  }

  market.candles.push(
    nextCandle
  )

  const maximumHistory =
    getTimeframeHistoryLength(
      market.timeframe
    ) + 30

  if (
    market.candles.length >
    maximumHistory
  ) {
    market.candles =
      market.candles.slice(
        -maximumHistory
      )
  }

  market.state.candleStartedAt =
    nextStartTime

  market.state.price =
    nextCandle.close
}

/*
 * ============================================================
 * FORMING CANDLE
 * ============================================================
 */

function updateFormingCandle(
  market: ContinuousMarket,
  timestamp: number
) {
  const currentBucket =
    getTimeframeBucket(
      timestamp,
      market.timeframe
    )

  if (
    market.state
      .candleStartedAt === 0 ||
    market.candles.length === 0
  ) {
    market.state.candleStartedAt =
      currentBucket

    const price =
      market.state.price

    market.candles.push({
      id: currentBucket,
      time: currentBucket,

      open:
        roundPrice(price),

      high:
        roundPrice(price),

      low:
        roundPrice(price),

      close:
        roundPrice(price),

      volume: 0,
    })
  }

  /*
   * Timeframe rollover.
   */
  let safety = 0

  while (
    market.state
      .candleStartedAt <
      currentBucket &&
    safety < 100
  ) {
    const nextStart =
      getNextTimeframeStart(
        market.state
          .candleStartedAt,
        market.timeframe
      )

    closeAndStartNextCandle(
      market,
      nextStart
    )

    safety++
  }

  /*
   * Update the SAME current candle.
   *
   * This allows:
   *
   * UP → DOWN → UP → DOWN
   *
   * while preserving every real high and low
   * reached by the simulated price.
   */
  updateMarketTick(
    market,
    timestamp
  )
}

/*
 * ============================================================
 * PUBLIC MARKET UPDATE
 * ============================================================
 */

export function updateMarket(
  market: ContinuousMarket
) {
  updateFormingCandle(
    market,
    Date.now()
  )
}

/*
 * ============================================================
 * BID / ASK
 * ============================================================
 */

export function getBidPrice(
  market: ContinuousMarket
) {
  return Math.max(
    Number.EPSILON,
    market.state.price -
      market.spread / 2
  )
}

export function getAskPrice(
  market: ContinuousMarket
) {
  return Math.max(
    Number.EPSILON,
    market.state.price +
      market.spread / 2
  )
}

/*
 * ============================================================
 * MARKET UPDATE SPEED
 * ============================================================
 */

export function getMarketUpdateInterval(
  market: ContinuousMarket
) {
  let baseInterval = 750

  switch (market.category) {
    case "nfp":
      baseInterval = 450
      break

    case "crypto":
      baseInterval = 700
      break

    case "synthetic":
      baseInterval = 650
      break

    case "commodity":
      baseInterval = 800
      break

    case "index":
      baseInterval = 850
      break

    case "forex":
      baseInterval = 900
      break

    default:
      baseInterval = 750
  }

  let timeframeMultiplier = 1

  switch (market.timeframe) {
    case "1m":
      timeframeMultiplier = 1
      break

    case "5m":
      timeframeMultiplier = 1
      break

    case "15m":
      timeframeMultiplier = 1.05
      break

    case "1h":
      timeframeMultiplier = 1.10
      break

    case "1d":
      timeframeMultiplier = 1.15
      break

    case "1w":
      timeframeMultiplier = 1.20
      break

    case "1mo":
      timeframeMultiplier = 1.25
      break

    default:
      timeframeMultiplier = 1
  }

  return Math.max(
    350,
    Math.min(
      1500,
      Math.round(
        baseInterval *
          timeframeMultiplier
      )
    )
  )
}

/*
 * ============================================================
 * MARKET CREATION
 * ============================================================
 */

type MarketConfig = {
  id: string
  symbol: string
  name: string
  category: MarketCategory
  broker: string
  startingPrice: number
  spread: number
  seed: number
}

function createContinuousMarket(
  config: MarketConfig,
  timeframe: Timeframe = "1m"
): ContinuousMarket {
  const now =
    Date.now()

  const currentBucket =
    getTimeframeBucket(
      now,
      timeframe
    )

  /*
   * Base volatility.
   */
  const volatility =
    config.category ===
    "forex"
      ? 0.00055
      : config.category ===
          "commodity"
        ? 0.00075
        : config.category ===
            "crypto"
          ? 0.0010
          : config.category ===
              "nfp"
            ? 0.00040
            : 0.0010

  /*
   * Every timeframe receives a different
   * deterministic movement stream.
   */
  const timeframeSeed =
    (
      config.seed +
      getTimeframeSeedOffset(
        timeframe
      )
    ) >>>
    0

  /*
   * Calculate the beginning of the
   * historical window.
   */
  const historyLength =
    getTimeframeHistoryLength(
      timeframe
    )

  let historyStart =
    currentBucket

  for (
    let i = 0;
    i < historyLength;
    i++
  ) {
    historyStart =
      getPreviousTimeframeStart(
        historyStart,
        timeframe
      )
  }

  /*
   * Build completed history.
   */
  const historical =
    buildHistoricalCandles(
      config.startingPrice,
      timeframeSeed,
      historyStart,
      volatility,
      timeframe
    )

  const last =
    historical[
      historical.length - 1
    ]

  const startingLivePrice =
    last?.close ??
    config.startingPrice

  const state =
    createInitialState(
      startingLivePrice,
      timeframeSeed,
      currentBucket,
      volatility
    )

  /*
   * Current forming candle.
   */
  const currentCandle: Candle = {
    id: currentBucket,

    time: currentBucket,

    open:
      roundPrice(
        startingLivePrice
      ),

    high:
      roundPrice(
        startingLivePrice
      ),

    low:
      roundPrice(
        startingLivePrice
      ),

    close:
      roundPrice(
        startingLivePrice
      ),

    volume: 0,
  }

  const candles = [
    ...historical,
    currentCandle,
  ]

  const market: ContinuousMarket = {
    id: config.id,

    symbol:
      config.symbol,

    name:
      config.name,

    category:
      config.category,

    broker:
      config.broker,

    startingPrice:
      config.startingPrice,

    spread:
      config.spread,

    timeframe,

    candles,

    state,
  }

  /*
   * Analyze latest completed candle.
   */
  if (
    historical.length >= 3
  ) {
    const pattern =
      getPatternSignal(
        historical
      )

    if (
      pattern.name
    ) {
      state.lastPattern =
        pattern.name

      state.patternBias =
        pattern.bias

      state.patternStrength =
        pattern.strength
    }

    state.lastPatternCandleTime =
      historical[
        historical.length - 1
      ].time
  }

  return market
}

/*
 * ============================================================
 * MARKET CONFIGURATION
 * ============================================================
 */

const MARKET_CONFIGS:
  MarketConfig[] = [
    /*
     * ========================================================
     * SYNTHETIC
     * ========================================================
     */

    {
      id:
        "kg-synthetic-100",

      symbol:
        "KG-SYN",

      name:
        "KG Synthetic 100",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        100,

      spread:
        0.02,

      seed:
        1001,
    },

    /*
     * ========================================================
     * CRYPTO
     * ========================================================
     */

    {
      id:
        "kg-btc",

      symbol:
        "KG-BTC",

      name:
        "KG Bitcoin Simulation",

      category:
        "crypto",

      broker:
        "KG Brokers",

      startingPrice:
        65000,

      spread:
        12,

      seed:
        2002,
    },

    {
      id:
        "kg-eth",

      symbol:
        "ETHUSD",

      name:
        "Ethereum / USD Simulation",

      category:
        "crypto",

      broker:
        "KG Brokers",

      startingPrice:
        2600,

      spread:
        2,

      seed:
        10101,
    },

    /*
     * ========================================================
     * FOREX
     * ========================================================
     */

    {
      id:
        "kg-eurusd",

      symbol:
        "KG-EURUSD",

      name:
        "KG EUR/USD Simulation",

      category:
        "forex",

      broker:
        "KG Brokers",

      startingPrice:
        1.08,

      spread:
        0.00008,

      seed:
        3003,
    },

    {
      id:
        "kg-gbpusd",

      symbol:
        "GBPUSD",

      name:
        "British Pound / USD Simulation",

      category:
        "forex",

      broker:
        "KG Brokers",

      startingPrice:
        1.27,

      spread:
        0.00008,

      seed:
        10202,
    },

    {
      id:
        "kg-usdjpy",

      symbol:
        "USDJPY",

      name:
        "USD / Japanese Yen Simulation",

      category:
        "forex",

      broker:
        "KG Brokers",

      startingPrice:
        149.5,

      spread:
        0.008,

      seed:
        10303,
    },

    /*
     * ========================================================
     * ZIG / USD
     * ========================================================
     *
     * SIMULATION ONLY.
     *
     * The starting price is a simulator value and is not
     * intended to represent a live market quotation.
     */

    {
      id:
        "kg-zigusd",

      symbol:
        "ZIGUSD",

      name:
        "ZIG/USD Simulation",

      category:
        "forex",

      broker:
        "KG Brokers",

      startingPrice:
        0.030,

      spread:
        0.00002,

      seed:
        10404,
    },

    /*
     * ========================================================
     * INDEX
     * ========================================================
     */

    {
      id:
        "kg-index",

      symbol:
        "KG-INDEX",

      name:
        "KG Global Index",

      category:
        "index",

      broker:
        "KG Brokers",

      startingPrice:
        5000,

      spread:
        0.5,

      seed:
        4004,
    },

    /*
     * ========================================================
     * NFP
     * ========================================================
     */

    {
      id:
        "kg-nfp-1",

      symbol:
        "NFP",

      name:
        "US Non-Farm Payrolls Simulation",

      category:
        "nfp",

      broker:
        "KG Brokers",

      startingPrice:
        100000,

      spread:
        25,

      seed:
        5005,
    },

    /*
     * ========================================================
     * VOLATILITY MARKETS
     * ========================================================
     */

    {
      id:
        "kg-volatility-10",

      symbol:
        "VOL 10",

      name:
        "Volatility 10 Simulation",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        1000,

      spread:
        0.5,

      seed:
        8101,
    },

    {
      id:
        "kg-volatility-25",

      symbol:
        "VOL 25",

      name:
        "Volatility 25 Simulation",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        1000,

      spread:
        0.5,

      seed:
        8202,
    },

    {
      id:
        "kg-volatility-50",

      symbol:
        "VOL 50",

      name:
        "Volatility 50 Simulation",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        1000,

      spread:
        0.5,

      seed:
        8303,
    },

    /*
     * ========================================================
     * BOOM MARKETS
     * ========================================================
     */

    {
      id:
        "kg-boom-300",

      symbol:
        "BOOM 300",

      name:
        "BOOM 300 Volatility Simulation",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        1000,

      spread:
        0.5,

      seed:
        9101,
    },

    {
      id:
        "kg-boom-500",

      symbol:
        "BOOM 500",

      name:
        "BOOM 500 Volatility Simulation",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        1000,

      spread:
        0.5,

      seed:
        9202,
    },

    {
      id:
        "kg-boom-1000",

      symbol:
        "BOOM 1000",

      name:
        "BOOM 1000 Volatility Simulation",

      category:
        "synthetic",

      broker:
        "KG Brokers",

      startingPrice:
        1000,

      spread:
        0.5,

      seed:
        9303,
    },

    /*
     * ========================================================
     * GOLD
     * ========================================================
     */

    {
      id:
        "kg-xauusd",

      symbol:
        "XAUUSD",

      name:
        "Gold / USD Simulation",

      category:
        "commodity",

      broker:
        "KG Brokers",

      startingPrice:
        2650,

      spread:
        0.5,

      seed:
        7007,
    },
  ]

/*
 * ============================================================
 * CREATE ALL DEMO MARKETS FOR A TIMEFRAME
 * ============================================================
 */

export function getDemoMarketsForTimeframe(
  timeframe: Timeframe
): ContinuousMarket[] {
  return MARKET_CONFIGS.map(
    (config) =>
      createContinuousMarket(
        config,
        timeframe
      )
  )
}

/*
 * ============================================================
 * MARKET SEED
 * ============================================================
 */

function getMarketSeed(
  id: string
) {
  let hash = 0

  for (
    let i = 0;
    i < id.length;
    i++
  ) {
    hash =
      (
        hash * 31 +
        id.charCodeAt(i)
      ) >>>
      0
  }

  return (
    hash ||
    12345
  )
}

/*
 * ============================================================
 * CREATE MARKET FOR DIFFERENT TIMEFRAME
 * ============================================================
 */

export function createMarketForTimeframe(
  market: ContinuousMarket,
  timeframe: Timeframe
) {
  const config: MarketConfig = {
    id:
      market.id,

    symbol:
      market.symbol,

    name:
      market.name,

    category:
      market.category,

    broker:
      market.broker,

    startingPrice:
      market.startingPrice,

    spread:
      market.spread,

    seed:
      getMarketSeed(
        market.id
      ),
  }

  return createContinuousMarket(
    config,
    timeframe
  )
}

/*
 * ============================================================
 * DEFAULT DEMO MARKETS
 * ============================================================
 *
 * Existing demo code continues to receive
 * the normal 1-minute markets.
 *
 * The demo page can request another timeframe
 * with getDemoMarketsForTimeframe().
 * ============================================================
 */

export const demoMarkets:
  ContinuousMarket[] =
  getDemoMarketsForTimeframe(
    "1m"
  )