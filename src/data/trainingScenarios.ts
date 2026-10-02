export type ScenarioChoice = {
  id: string
  label: string
  description: string
}

export type TrainingScenario = {
  id: string
  levelId: number
  title: string
  description: string
  market: string
  objective: string
  choices: ScenarioChoice[]
  correctChoice: string
  explanation: string
}

export const trainingScenarios: TrainingScenario[] = [
  {
    id: "beginner-bullish-candle",
    levelId: 1,
    title: "Identify a Bullish Candle",
    description:
      "The simulated market has just printed a candle where the closing price is above the opening price.",
    market: "KG Synthetic 100",
    objective:
      "Identify what the candle is communicating about the current price movement.",
    choices: [
      {
        id: "bullish",
        label: "Bullish",
        description:
          "Buyers moved price higher during the candle.",
      },
      {
        id: "bearish",
        label: "Bearish",
        description:
          "Sellers moved price lower during the candle.",
      },
      {
        id: "neutral",
        label: "Neutral",
        description:
          "The candle gives no directional information.",
      },
    ],
    correctChoice: "bullish",
    explanation:
      "A bullish candle closes above its opening price. This means the simulated price finished the candle higher than where it started.",
  },

  {
    id: "beginner-bearish-candle",
    levelId: 1,
    title: "Identify a Bearish Candle",
    description:
      "The simulated market has printed a candle where the closing price is below the opening price.",
    market: "KG Synthetic 100",
    objective:
      "Identify what the candle is communicating about the current price movement.",
    choices: [
      {
        id: "bullish",
        label: "Bullish",
        description:
          "Buyers pushed the market higher.",
      },
      {
        id: "bearish",
        label: "Bearish",
        description:
          "Sellers pushed the market lower.",
      },
      {
        id: "neutral",
        label: "Neutral",
        description:
          "There is no directional movement.",
      },
    ],
    correctChoice: "bearish",
    explanation:
      "A bearish candle closes below its opening price. The simulated market therefore finished the candle lower than where it started.",
  },

  {
    id: "chart-uptrend",
    levelId: 2,
    title: "Identify an Uptrend",
    description:
      "The simulated chart is forming a sequence of higher highs and higher lows.",
    market: "KG Synthetic 100",
    objective:
      "Identify the overall direction of the simulated market.",
    choices: [
      {
        id: "uptrend",
        label: "Uptrend",
        description:
          "Price is generally making higher highs and higher lows.",
      },
      {
        id: "downtrend",
        label: "Downtrend",
        description:
          "Price is generally making lower highs and lower lows.",
      },
      {
        id: "range",
        label: "Range",
        description:
          "Price is moving sideways without a clear trend.",
      },
    ],
    correctChoice: "uptrend",
    explanation:
      "An uptrend is commonly identified by higher highs and higher lows. Short pullbacks can occur without immediately changing the overall trend.",
  },

  {
    id: "chart-downtrend",
    levelId: 2,
    title: "Identify a Downtrend",
    description:
      "The simulated chart is forming a sequence of lower highs and lower lows.",
    market: "KG Synthetic 100",
    objective:
      "Identify the overall direction of the simulated market.",
    choices: [
      {
        id: "uptrend",
        label: "Uptrend",
        description:
          "Price is generally making higher highs and higher lows.",
      },
      {
        id: "downtrend",
        label: "Downtrend",
        description:
          "Price is generally making lower highs and lower lows.",
      },
      {
        id: "range",
        label: "Range",
        description:
          "Price is moving sideways without a clear trend.",
      },
    ],
    correctChoice: "downtrend",
    explanation:
      "A downtrend is commonly identified by lower highs and lower lows. Temporary upward movements can occur during a broader downtrend.",
  },

  {
    id: "risk-position-size",
    levelId: 3,
    title: "Choose an Appropriate Position Size",
    description:
      "The simulated account has limited capital and the market is moving unpredictably.",
    market: "KG Synthetic 100",
    objective:
      "Choose the approach that demonstrates responsible risk management.",
    choices: [
      {
        id: "small",
        label: "Use a controlled position size",
        description:
          "Keep the simulated exposure appropriate for the account.",
      },
      {
        id: "large",
        label: "Use the largest position possible",
        description:
          "Take maximum simulated exposure to increase potential returns.",
      },
      {
        id: "all-in",
        label: "Use the entire account",
        description:
          "Put nearly all simulated capital into one position.",
      },
    ],
    correctChoice: "small",
    explanation:
      "Responsible position sizing limits how much of the simulated account is exposed to one trade. Larger exposure can magnify both gains and losses.",
  },

  {
    id: "risk-overtrading",
    levelId: 3,
    title: "Avoid Overtrading",
    description:
      "The simulated market has been moving sideways and there is no clear setup.",
    market: "KG Synthetic 100",
    objective:
      "Decide how to respond when there is no strong trading setup.",
    choices: [
      {
        id: "wait",
        label: "Wait for a clearer setup",
        description:
          "Remain patient until the simulated market provides useful information.",
      },
      {
        id: "trade",
        label: "Open many positions",
        description:
          "Trade frequently simply because the market is moving.",
      },
      {
        id: "increase",
        label: "Increase position size",
        description:
          "Use larger simulated positions to compensate for the lack of a setup.",
      },
    ],
    correctChoice: "wait",
    explanation:
      "Not every market movement provides a useful setup. Waiting can help avoid unnecessary simulated trades and excessive exposure.",
  },

  {
    id: "technical-breakout",
    levelId: 4,
    title: "Identify a Breakout",
    description:
      "The simulated market has been moving inside a relatively narrow range before making a strong move beyond that range.",
    market: "KG Synthetic 100",
    objective:
      "Recognize the basic structure of a breakout.",
    choices: [
      {
        id: "breakout",
        label: "Breakout",
        description:
          "Price has moved beyond an established range.",
      },
      {
        id: "range",
        label: "Range",
        description:
          "Price is still contained inside the same range.",
      },
      {
        id: "reversal",
        label: "Reversal",
        description:
          "Price has clearly changed direction after an established trend.",
      },
    ],
    correctChoice: "breakout",
    explanation:
      "A breakout occurs when price moves beyond an established support or resistance area. Traders often look for confirmation because not every break remains sustained.",
  },

  {
    id: "technical-pullback",
    levelId: 4,
    title: "Recognize a Pullback",
    description:
      "The simulated market has been rising, then temporarily moves lower before beginning to recover.",
    market: "KG Synthetic 100",
    objective:
      "Identify the temporary movement against the broader direction.",
    choices: [
      {
        id: "pullback",
        label: "Pullback",
        description:
          "Price temporarily moves against the broader trend.",
      },
      {
        id: "breakout",
        label: "Breakout",
        description:
          "Price moves beyond a major range boundary.",
      },
      {
        id: "range",
        label: "Range",
        description:
          "Price remains completely sideways.",
      },
    ],
    correctChoice: "pullback",
    explanation:
      "A pullback is a temporary movement against the broader direction of a market. It does not automatically mean the larger trend has ended.",
  },

  {
    id: "strategy-entry",
    levelId: 5,
    title: "Evaluate an Entry Setup",
    description:
      "The simulated market is developing a directional movement, but the setup still needs confirmation.",
    market: "KG Synthetic 100",
    objective:
      "Think about whether the available information is sufficient before entering a simulated position.",
    choices: [
      {
        id: "confirm",
        label: "Wait for confirmation",
        description:
          "Look for additional evidence that supports the setup.",
      },
      {
        id: "rush",
        label: "Enter immediately",
        description:
          "Open a position without waiting for confirmation.",
      },
      {
        id: "random",
        label: "Choose a direction randomly",
        description:
          "Enter without using a defined process.",
      },
    ],
    correctChoice: "confirm",
    explanation:
      "A defined entry process can help reduce impulsive decisions. Confirmation should come from the strategy being practiced rather than from guessing.",
  },

  {
    id: "strategy-exit",
    levelId: 5,
    title: "Evaluate an Exit",
    description:
      "The simulated position has moved favorably and the market is beginning to weaken.",
    market: "KG Synthetic 100",
    objective:
      "Think about how an exit should relate to a predefined trading plan.",
    choices: [
      {
        id: "plan",
        label: "Follow the exit plan",
        description:
          "Use the predefined conditions for closing the simulated position.",
      },
      {
        id: "hold",
        label: "Ignore the plan",
        description:
          "Continue holding regardless of the conditions.",
      },
      {
        id: "random",
        label: "Exit randomly",
        description:
          "Close the position without a defined reason.",
      },
    ],
    correctChoice: "plan",
    explanation:
      "A structured exit plan helps keep decisions consistent. The purpose is to follow predefined conditions rather than reacting emotionally to every price movement.",
  },

  {
    id: "advanced-confluence",
    levelId: 6,
    title: "Look for Confluence",
    description:
      "Several pieces of technical information in the simulated market point in the same general direction.",
    market: "KG Synthetic 100",
    objective:
      "Understand the role of multiple supporting signals.",
    choices: [
      {
        id: "confluence",
        label: "Look for confluence",
        description:
          "Consider whether multiple independent observations support the same idea.",
      },
      {
        id: "single",
        label: "Use one signal only",
        description:
          "Ignore all other available market information.",
      },
      {
        id: "random",
        label: "Ignore the analysis",
        description:
          "Choose a direction without considering the evidence.",
      },
    ],
    correctChoice: "confluence",
    explanation:
      "Confluence means several pieces of analysis support the same market idea. It can provide a more structured decision process, although it does not guarantee an outcome.",
  },

  {
    id: "professional-independent",
    levelId: 7,
    title: "Make an Independent Decision",
    description:
      "The simulated market does not provide an obvious setup. You must evaluate the available information and decide whether there is enough evidence to act.",
    market: "KG Synthetic 100",
    objective:
      "Practice making a structured decision without relying on guesses or outside pressure.",
    choices: [
      {
        id: "analyze",
        label: "Analyze and follow your rules",
        description:
          "Review the market information and act only if your defined conditions are satisfied.",
      },
      {
        id: "guess",
        label: "Guess the direction",
        description:
          "Choose BUY or SELL without sufficient evidence.",
      },
      {
        id: "pressure",
        label: "Follow the crowd",
        description:
          "Copy other simulated traders without evaluating the setup yourself.",
      },
    ],
    correctChoice: "analyze",
    explanation:
      "Independent decision-making means applying a defined process to the available information. If the conditions are not satisfied, waiting is also a valid simulated trading decision.",
  },
]

export function getTrainingScenarios(
  levelId: number
): TrainingScenario[] {
  return trainingScenarios.filter(
    (scenario) => scenario.levelId === levelId
  )
}