export type TrainingLevel = {
  id: number
  title: string
  description: string
  lessons: string[]
  scenarios: string[]
}

export const trainingLevels: TrainingLevel[] = [
  {
    id: 1,
    title: "Absolute Beginner",
    description: "Learn the foundations of trading and financial markets.",
    lessons: [
      "What trading is",
      "Markets and instruments",
      "Trading sessions",
      "Understanding candles",
      "Bid, ask and spread",
      "Long and short positions",
      "Market, limit and stop orders",
      "Stop loss and take profit",
      "Basic trading risk",
    ],
    scenarios: [
      "Identify a bullish candle",
      "Identify a bearish candle",
      "Choose between BUY and SELL",
    ],
  },

  {
    id: 2,
    title: "Chart Reading",
    description: "Learn how to interpret price movement.",
    lessons: [
      "Understanding trends",
      "Higher highs and higher lows",
      "Lower highs and lower lows",
      "Support and resistance",
      "Candlestick patterns",
      "Timeframes",
      "Volume",
      "Market structure",
      "Basic trading setups",
    ],
    scenarios: [
      "Identify an uptrend",
      "Identify a downtrend",
      "Find support",
      "Find resistance",
    ],
  },

  {
    id: 3,
    title: "Risk Management",
    description: "Learn how to control risk before entering trades.",
    lessons: [
      "Risk per trade",
      "Position sizing",
      "Risk-to-reward ratio",
      "Maximum daily loss",
      "Drawdown",
      "Consecutive losses",
      "Overtrading",
      "Risk discipline",
    ],
    scenarios: [
      "Choose a safe position size",
      "Calculate risk-to-reward",
      "Handle a losing streak",
      "Identify excessive risk",
    ],
  },

  {
    id: 4,
    title: "Technical Analysis",
    description: "Learn common tools used to analyze price movement.",
    lessons: [
      "Moving averages",
      "Momentum",
      "Volatility",
      "Support and resistance",
      "Breakouts",
      "Pullbacks",
      "Trend continuation",
      "Range markets",
    ],
    scenarios: [
      "Identify a breakout",
      "Identify a pullback",
      "Identify a range",
      "Identify strong momentum",
    ],
  },

  {
    id: 5,
    title: "Strategy Building",
    description: "Learn how to create rules instead of making random trades.",
    lessons: [
      "Entry rules",
      "Exit rules",
      "Stop loss rules",
      "Take profit rules",
      "Risk rules",
      "Backtesting",
      "Strategy consistency",
      "Avoiding random entries",
    ],
    scenarios: [
      "Build an entry plan",
      "Create exit rules",
      "Test a strategy",
      "Identify a rule violation",
    ],
  },

  {
    id: 6,
    title: "Advanced Trading",
    description: "Develop more advanced market-analysis skills.",
    lessons: [
      "Multi-timeframe analysis",
      "Advanced market structure",
      "Confluence",
      "Advanced risk management",
      "Strategy testing",
      "Trade management",
      "Performance analysis",
    ],
    scenarios: [
      "Combine multiple confirmations",
      "Analyze multiple timeframes",
      "Manage an open position",
      "Review trading performance",
    ],
  },

  {
    id: 7,
    title: "Professional Simulation",
    description:
      "Trade simulated markets independently without instructional hints.",
    lessons: [
      "Build your own simulated trading plan",
      "Execute your plan",
      "Manage simulated positions",
      "Maintain a trading journal",
      "Review performance",
      "Maintain strategy consistency",
    ],
    scenarios: [
      "Independent market analysis",
      "Independent trade decision",
      "Position management",
      "Full trading assessment",
    ],
  },
]

export const totalTrainingLessons = trainingLevels.reduce(
  (total, level) => total + level.lessons.length,
  0
)

export const totalTrainingScenarios = trainingLevels.reduce(
  (total, level) => total + level.scenarios.length,
  0
)