export type Timeframe =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1H"
  | "4H"
  | "1D"

export type MarketCategory =
  | "synthetic"
  | "crypto"
  | "forex"
  | "index"
  | "commodity"
  | "nfp"

export type OrderSide =
  | "buy"
  | "sell"

export type OrderType =
  | "market"
  | "limit"
  | "stop"

export type CloseReason =
  | "manual"
  | "stop_loss"
  | "take_profit"
  | "margin_protection"

export interface Candle {
  id: number
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SimulatedMarket {
  id: string
  symbol: string
  name: string
  category: MarketCategory
  broker: string
  startingPrice: number
  candles: Candle[]
}

export interface Position {
  id: string
  symbol: string
  side: OrderSide
  lotSize: number
  entryPrice: number
  currentPrice: number
  leverage: number
  positionValue: number
  requiredMargin: number
  stopLoss?: number
  takeProfit?: number
  openedAt: number
  unrealizedPnl: number
}

export interface ClosedTrade {
  id: string
  symbol: string
  side: OrderSide
  lotSize: number
  entryPrice: number
  exitPrice: number
  leverage: number
  profitLoss: number
  openedAt: number
  closedAt: number
  closeReason: CloseReason
}

export interface DemoAccount {
  id: string
  broker: string
  balance: number
  equity: number
  usedMargin: number
  availableMargin: number
  leverage: number
  positions: Position[]
  tradeHistory: ClosedTrade[]
}

export interface MarketClock {
  currentCandleIndex: number
  isRunning: boolean
  speed: number
}

export interface TrainingProgress {
  level: number
  lessonsCompleted: number
  totalLessons: number
  scenariosCompleted: number
  totalScenarios: number
  quizzesCompleted: number
  quizzesPassed: number
}