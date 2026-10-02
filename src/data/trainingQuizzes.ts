export type TrainingQuiz = {
  id: string
  levelId: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export const trainingQuizzes: TrainingQuiz[] = [
  {
    id: "beginner-candle",
    levelId: 1,
    question: "Which four prices make up a standard candlestick?",
    options: [
      "Open, High, Low and Close",
      "Bid, Ask, Spread and Volume",
      "Entry, Stop, Target and Margin",
      "Buy, Sell, Hold and Exit",
    ],
    correctAnswer: 0,
    explanation:
      "A standard candlestick contains the open, high, low and close prices for its period.",
  },

  {
    id: "beginner-buy",
    levelId: 1,
    question: "What does a BUY position generally expect?",
    options: [
      "Price to rise",
      "Price to remain unchanged",
      "Price to fall",
      "The spread to disappear",
    ],
    correctAnswer: 0,
    explanation:
      "A BUY position generally benefits when the closing price is above the entry price.",
  },

  {
    id: "beginner-sell",
    levelId: 1,
    question: "What does a SELL position generally expect?",
    options: [
      "Price to rise",
      "Price to fall",
      "Volume to disappear",
      "The market to stop moving",
    ],
    correctAnswer: 1,
    explanation:
      "A SELL position generally benefits when price falls below the entry price.",
  },

  {
    id: "beginner-spread",
    levelId: 1,
    question: "What is the spread?",
    options: [
      "The difference between bid and ask",
      "The account balance",
      "The trading timeframe",
      "The distance between two candles",
    ],
    correctAnswer: 0,
    explanation:
      "The spread is the difference between the bid and ask prices.",
  },

  {
    id: "chart-trend",
    levelId: 2,
    question: "Which structure commonly describes an uptrend?",
    options: [
      "Lower highs and lower lows",
      "Higher highs and higher lows",
      "Only equal highs",
      "No price movement",
    ],
    correctAnswer: 1,
    explanation:
      "Higher highs and higher lows are common characteristics of upward market structure.",
  },

  {
    id: "chart-support",
    levelId: 2,
    question: "What does support generally describe?",
    options: [
      "An area where price may encounter buying interest",
      "A guaranteed reversal price",
      "The account's available margin",
      "The highest price of the day",
    ],
    correctAnswer: 0,
    explanation:
      "Support describes an area where downward movement may encounter buying interest. It is not a guaranteed reversal point.",
  },

  {
    id: "risk-position",
    levelId: 3,
    question: "Why is position sizing important?",
    options: [
      "It controls exposure to a trade",
      "It guarantees a winning trade",
      "It removes market volatility",
      "It predicts the next candle",
    ],
    correctAnswer: 0,
    explanation:
      "Position sizing helps control how much exposure a simulated position creates.",
  },

  {
    id: "risk-drawdown",
    levelId: 3,
    question: "What does drawdown measure?",
    options: [
      "A decline from a previous account high",
      "The spread between bid and ask",
      "The number of candles on a chart",
      "The length of a trading session",
    ],
    correctAnswer: 0,
    explanation:
      "Drawdown measures a decline in account value from a previous high point.",
  },

  {
    id: "risk-overtrading",
    levelId: 3,
    question: "What is overtrading?",
    options: [
      "Following a predefined trading plan",
      "Taking more trades than the plan calls for",
      "Closing a position at its target",
      "Studying market structure",
    ],
    correctAnswer: 1,
    explanation:
      "Overtrading means taking more trades than justified by the trading plan or setup conditions.",
  },

  {
    id: "technical-breakout",
    levelId: 4,
    question: "What is a breakout?",
    options: [
      "Price moving beyond an established area or level",
      "A market with no movement",
      "A completed journal entry",
      "A type of account balance",
    ],
    correctAnswer: 0,
    explanation:
      "A breakout occurs when price moves beyond an established area or level.",
  },

  {
    id: "strategy-entry",
    levelId: 5,
    question: "What should a strategy's entry rules define?",
    options: [
      "Conditions required before entering",
      "The user's password",
      "The color of the chart",
      "The computer's hardware",
    ],
    correctAnswer: 0,
    explanation:
      "Entry rules define the conditions that should be present before a trade is considered.",
  },

  {
    id: "strategy-random",
    levelId: 5,
    question: "Why should random entries be avoided?",
    options: [
      "They do not follow a defined decision process",
      "They make candles disappear",
      "They increase screen brightness",
      "They change the currency",
    ],
    correctAnswer: 0,
    explanation:
      "A defined strategy gives the trader consistent conditions for making decisions.",
  },

  {
    id: "advanced-timeframe",
    levelId: 6,
    question: "Why might a trader examine multiple timeframes?",
    options: [
      "To view market movement from different perspectives",
      "To guarantee the next candle",
      "To remove all risk",
      "To increase the computer's speed",
    ],
    correctAnswer: 0,
    explanation:
      "Multiple timeframes can provide different perspectives on market structure and price movement.",
  },

  {
    id: "advanced-confluence",
    levelId: 6,
    question: "What does confluence mean in market analysis?",
    options: [
      "Several relevant factors supporting the same analysis",
      "Opening unlimited positions",
      "Ignoring risk management",
      "Using only one candle",
    ],
    correctAnswer: 0,
    explanation:
      "Confluence refers to multiple relevant factors aligning in support of an analysis.",
  },

  {
    id: "professional-plan",
    levelId: 7,
    question: "What is the purpose of a trading plan?",
    options: [
      "To define how decisions should be made",
      "To guarantee profits",
      "To predict every future candle",
      "To remove all uncertainty",
    ],
    correctAnswer: 0,
    explanation:
      "A trading plan provides predefined rules for analysis, entries, exits and risk management. It cannot guarantee results.",
  },
]

export function getQuizzesForLevel(
  levelId: number
): TrainingQuiz[] {
  return trainingQuizzes.filter(
    (quiz) => quiz.levelId === levelId
  )
}