export type LessonContent = {
  title: string
  explanation: string
  keyPoints: string[]
}

export const lessonContent: Record<string, LessonContent> = {
  "1:What trading is": {
    title: "What Trading Is",
    explanation:
      "Trading is the process of buying and selling an asset with the goal of managing a position as its price changes. MSA 26 uses simulated markets so you can practice these decisions without real money.",
    keyPoints: [
      "A market has buyers and sellers.",
      "Prices move as market conditions change.",
      "A BUY position benefits from an increase in price.",
      "A SELL position benefits from a decrease in price.",
      "Every MSA 26 trade uses virtual money.",
    ],
  },

  "1:Markets and instruments": {
    title: "Markets and Instruments",
    explanation:
      "Different markets contain different types of instruments. MSA 26 provides simulated examples of forex-style markets, crypto, indices, commodities and synthetic markets.",
    keyPoints: [
      "Forex-style markets represent currency pairs.",
      "Crypto simulations represent digital-asset markets.",
      "Indices represent groups of assets.",
      "Commodities can represent assets such as gold or oil.",
      "Synthetic markets are simulated instruments.",
    ],
  },

  "1:Trading sessions": {
    title: "Trading Sessions",
    explanation:
      "Financial markets can behave differently during different periods of the trading day. Activity and volatility can change as different market participants become active.",
    keyPoints: [
      "Different markets have different active periods.",
      "Trading activity can change during a session.",
      "Volatility can increase or decrease.",
      "A simulator can reproduce different market conditions.",
    ],
  },

  "1:Understanding candles": {
    title: "Understanding Candles",
    explanation:
      "A candlestick represents price movement during a specific period. Each candle contains an open, high, low and close price.",
    keyPoints: [
      "Open is the starting price.",
      "High is the highest price reached.",
      "Low is the lowest price reached.",
      "Close is the ending price.",
      "The candle timeframe determines how much time it represents.",
    ],
  },

  "1:Bid, ask and spread": {
    title: "Bid, Ask and Spread",
    explanation:
      "The bid is the price at which a simulated market can buy from you, while the ask is the price at which you can buy. The difference between them is the spread.",
    keyPoints: [
      "BUY orders use the ask price.",
      "SELL orders use the bid price.",
      "BUY positions normally close using the bid.",
      "SELL positions normally close using the ask.",
      "The spread creates a difference between execution prices.",
    ],
  },

  "1:Long and short positions": {
    title: "Long and Short Positions",
    explanation:
      "A long position is a BUY position. A short position is a SELL position. The two positions respond differently when price changes.",
    keyPoints: [
      "BUY means you expect price to rise.",
      "SELL means you expect price to fall.",
      "A BUY position gains when its closing price is above its entry price.",
      "A SELL position gains when its closing price is below its entry price.",
    ],
  },

  "1:Market, limit and stop orders": {
    title: "Order Types",
    explanation:
      "Different order types define how an order should be entered. MSA 26 can use these concepts to teach planned trade execution.",
    keyPoints: [
      "A market order executes at an available simulated price.",
      "A limit order is intended to execute at a specified price or better.",
      "A stop order is intended to activate after price reaches a specified level.",
      "Order type should match the trading plan.",
    ],
  },

  "1:Stop loss and take profit": {
    title: "Stop Loss and Take Profit",
    explanation:
      "A stop loss defines a simulated exit intended to limit a losing position. A take profit defines a simulated exit intended to close a profitable position at a planned level.",
    keyPoints: [
      "Stop loss manages downside risk.",
      "Take profit defines a planned profit exit.",
      "They should be chosen before or as part of a trading plan.",
      "Neither guarantees a particular financial result in real markets.",
    ],
  },

  "1:Basic trading risk": {
    title: "Basic Trading Risk",
    explanation:
      "Risk management is about controlling how much of an account can be exposed to a trade or sequence of trades.",
    keyPoints: [
      "Every trade has uncertainty.",
      "Larger positions create larger simulated exposure.",
      "A losing streak can reduce account equity.",
      "Risk limits help prevent one decision from dominating performance.",
      "MSA 26 uses virtual money for training.",
    ],
  },

  "2:Understanding trends": {
    title: "Understanding Trends",
    explanation:
      "A trend describes the general direction of price movement over a period of time.",
    keyPoints: [
      "Uptrends generally contain rising swing points.",
      "Downtrends generally contain falling swing points.",
      "Markets can also move sideways.",
      "A trend can look different on different timeframes.",
    ],
  },

  "2:Higher highs and higher lows": {
    title: "Higher Highs and Higher Lows",
    explanation:
      "Higher highs and higher lows are common structural characteristics of an upward market.",
    keyPoints: [
      "A higher high exceeds a previous significant high.",
      "A higher low remains above a previous significant low.",
      "Repeated higher highs and higher lows can indicate upward structure.",
    ],
  },

  "2:Lower highs and lower lows": {
    title: "Lower Highs and Lower Lows",
    explanation:
      "Lower highs and lower lows are common structural characteristics of a downward market.",
    keyPoints: [
      "A lower high remains below a previous significant high.",
      "A lower low falls below a previous significant low.",
      "Repeated lower highs and lower lows can indicate downward structure.",
    ],
  },

  "2:Support and resistance": {
    title: "Support and Resistance",
    explanation:
      "Support and resistance describe areas where price has previously reacted or where traders may pay particular attention.",
    keyPoints: [
      "Support is an area where downward movement may encounter buying interest.",
      "Resistance is an area where upward movement may encounter selling interest.",
      "These are areas rather than guaranteed exact prices.",
      "Price can break through either area.",
    ],
  },

  "2:Candlestick patterns": {
    title: "Candlestick Patterns",
    explanation:
      "Candlestick patterns describe combinations of candle shapes that traders sometimes use as part of market analysis.",
    keyPoints: [
      "Candle shape provides information about price movement.",
      "Patterns should be considered in context.",
      "One candle alone does not guarantee a future outcome.",
    ],
  },

  "2:Timeframes": {
    title: "Timeframes",
    explanation:
      "A timeframe determines how much simulated market time each candle represents.",
    keyPoints: [
      "A 1-minute candle represents one minute.",
      "A 5-minute candle represents five minutes.",
      "Higher timeframes show broader price movement.",
      "Different timeframes can provide different perspectives.",
    ],
  },

  "2:Volume": {
    title: "Volume",
    explanation:
      "Volume represents the amount of activity associated with market movement. In MSA 26, volume is simulated.",
    keyPoints: [
      "Volume can help describe market activity.",
      "High activity and low activity can produce different conditions.",
      "Simulated volume is not real exchange volume.",
    ],
  },

  "2:Market structure": {
    title: "Market Structure",
    explanation:
      "Market structure examines how successive highs and lows relate to one another.",
    keyPoints: [
      "Structure can help identify directional movement.",
      "Structure can change over time.",
      "A market can transition between trends and ranges.",
    ],
  },

  "2:Basic trading setups": {
    title: "Basic Trading Setups",
    explanation:
      "A setup is a defined collection of market conditions that a trader watches before considering an entry.",
    keyPoints: [
      "A setup should have clear conditions.",
      "A setup should have an invalidation point.",
      "A setup should not guarantee a trade.",
      "Consistency is more important than random entries.",
    ],
  },

  "3:Risk per trade": {
    title: "Risk Per Trade",
    explanation:
      "Risk per trade describes how much of an account a trader is prepared to expose to a single simulated position.",
    keyPoints: [
      "Risk should be defined before entering.",
      "Position size affects exposure.",
      "A larger position can produce larger gains and losses.",
    ],
  },

  "3:Position sizing": {
    title: "Position Sizing",
    explanation:
      "Position sizing determines how large a simulated position should be based on the trading plan and risk limits.",
    keyPoints: [
      "Position size should reflect available capital.",
      "Stop distance can affect required position size.",
      "Leverage can increase exposure without increasing account balance.",
    ],
  },

  "3:Risk-to-reward ratio": {
    title: "Risk-to-Reward Ratio",
    explanation:
      "Risk-to-reward compares the amount potentially lost with the amount targeted in a planned trade.",
    keyPoints: [
      "A 1:2 ratio represents one unit of planned risk for two units of planned reward.",
      "The ratio does not guarantee that the target will be reached.",
      "Risk and reward should be considered together with the strategy.",
    ],
  },

  "3:Maximum daily loss": {
    title: "Maximum Daily Loss",
    explanation:
      "A maximum daily loss is a predefined limit intended to stop further simulated trading after losses reach a chosen threshold.",
    keyPoints: [
      "A daily limit can prevent continued trading during poor conditions.",
      "The limit should be defined before trading.",
      "MSA 26 can use limits as part of training scenarios.",
    ],
  },

  "3:Drawdown": {
    title: "Drawdown",
    explanation:
      "Drawdown measures a decline in account value from a previous high point.",
    keyPoints: [
      "Drawdown can occur after losing trades.",
      "Large drawdowns can require substantial recovery.",
      "Tracking drawdown helps evaluate risk.",
    ],
  },

  "3:Consecutive losses": {
    title: "Consecutive Losses",
    explanation:
      "A losing streak occurs when several trades close with losses in succession.",
    keyPoints: [
      "Losing streaks are possible even with a structured strategy.",
      "Increasing risk after losses can increase exposure.",
      "A predefined risk plan can help maintain discipline.",
    ],
  },

  "3:Overtrading": {
    title: "Overtrading",
    explanation:
      "Overtrading means taking more trades than the trading plan calls for, often without sufficient setup conditions.",
    keyPoints: [
      "More trades do not automatically mean better results.",
      "Each trade should have a reason.",
      "Trading limits can help maintain discipline.",
    ],
  },

  "3:Risk discipline": {
    title: "Risk Discipline",
    explanation:
      "Risk discipline means consistently following predefined risk rules rather than changing them because of emotions or recent results.",
    keyPoints: [
      "Use predefined risk limits.",
      "Avoid increasing size to recover losses.",
      "Review rule violations after simulated sessions.",
    ],
  },
}

export function getLessonContent(
  levelId: number,
  lesson: string
): LessonContent {
  const key = `${levelId}:${lesson}`

  return (
    lessonContent[key] ?? {
      title: lesson,
      explanation:
        "This lesson will be expanded as the MSA 26 training curriculum develops.",
      keyPoints: [
        "Study the concept carefully.",
        "Apply the concept in a simulated environment.",
        "Review your decisions after practice.",
      ],
    }
  )
}