import {
  Candle,
  MarketClock,
  SimulatedMarket,
} from "@/types/trading"

export class MarketEngine {
  private market: SimulatedMarket
  private clock: MarketClock

  constructor(market: SimulatedMarket) {
    this.market = market

    this.clock = {
      currentCandleIndex: 0,
      isRunning: false,
      speed: 1,
    }
  }

  getMarket(): SimulatedMarket {
    return this.market
  }

  getClock(): MarketClock {
    return this.clock
  }

  getCurrentCandle(): Candle {
    return this.market.candles[
      this.clock.currentCandleIndex
    ]
  }

  getVisibleCandles(): Candle[] {
    return this.market.candles.slice(
      0,
      this.clock.currentCandleIndex + 1
    )
  }

  advance(): Candle | null {
    if (
      this.clock.currentCandleIndex >=
      this.market.candles.length - 1
    ) {
      this.clock.isRunning = false
      return null
    }

    this.clock.currentCandleIndex += 1

    return this.getCurrentCandle()
  }

  advanceMinutes(minutes: number): Candle | null {
    const candlesToAdvance = Math.max(
      1,
      Math.floor(minutes)
    )

    let candle: Candle | null = null

    for (let i = 0; i < candlesToAdvance; i++) {
      candle = this.advance()

      if (!candle) {
        break
      }
    }

    return candle
  }

  setSpeed(speed: number) {
    this.clock.speed = Math.max(1, speed)
  }

  start() {
    this.clock.isRunning = true
  }

  pause() {
    this.clock.isRunning = false
  }

  reset() {
    this.clock.currentCandleIndex = 0
    this.clock.isRunning = false
  }
}