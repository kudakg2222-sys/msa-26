"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts"

import {
  demoMarkets,
  getAskPrice,
  getBidPrice,
  updateMarket,
  type ContinuousMarket,
  type Timeframe,
  TIMEFRAMES,
  getDemoMarketsForTimeframe,
  getMarketUpdateInterval,
} from "@/data/marketData"

type Side = "BUY" | "SELL"

type NotificationType =
  | "success"
  | "warning"
  | "danger"
  | "info"

type DemoNotification = {
  id: number
  type: NotificationType
  title: string
  message: string
  createdAt: number
}

type Position = {
  id: number
  marketId: string
  symbol: string
  category: ContinuousMarket["category"]
  side: Side
  lotSize: number
  leverage: number
  entryPrice: number
  currentPrice: number
  stopLoss: number | null
  takeProfit: number | null
  openedAt: number
  unrealizedPnl: number
  margin: number
}

type ClosedTrade = {
  id: number
  marketId: string
  symbol: string
  category: ContinuousMarket["category"]
  side: Side
  lotSize: number
  entryPrice: number
  exitPrice: number
  profitLoss: number
  openedAt: number
  closedAt: number
  closeReason?: string
}

const DEFAULT_STARTING_CAPITAL = 10000
const DEMO_STORAGE_KEY = "msa26-demo-account-v1"
const SETTINGS_STORAGE_KEY = "msa26-settings"

const DEFAULT_DEMO_LOT_SIZE = 0.01
const DEFAULT_DEMO_LEVERAGE = 100

const BROKERS = [
  "KG Brokers",
  "Mannie G Brokers",
  "TK Rings",
  "MSA Markets",
  "Global Demo Markets",
  "Prime Demo Markets",
  "Vertex Markets",
]

const LEVERAGES = [
  10,
  20,
  30,
  50,
  100,
  200,
  500,
  1000,
]

function cloneMarket(
  source: ContinuousMarket
): ContinuousMarket {
  return {
    ...source,
    candles: source.candles.map(
      (candle) => ({
        ...candle,
      })
    ),
  }
}

function createFreshMarkets(
  timeframe: Timeframe
): ContinuousMarket[] {
  return getDemoMarketsForTimeframe(
    timeframe
  ).map(cloneMarket)
}

function getContractSize(
  category: ContinuousMarket["category"]
): number {
  switch (category) {
    case "crypto":
      return 1
    case "forex":
      return 100000
    case "index":
      return 1
    case "commodity":
      return 100
    case "nfp":
      return 1
    default:
      return 1
  }
}

function formatPrice(
  price: number,
  category: ContinuousMarket["category"]
) {
  if (category === "forex") {
    return price.toFixed(5)
  }

  if (price >= 1000) {
    return price.toFixed(2)
  }

  return price.toFixed(4)
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function getNextNfpEvent() {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()

  let firstFriday = 1

  while (
    new Date(
      Date.UTC(
        year,
        month,
        firstFriday
      )
    ).getUTCDay() !== 5
  ) {
    firstFriday += 1
  }

  let event = new Date(
    Date.UTC(
      year,
      month,
      firstFriday,
      13,
      30,
      0
    )
  )

  if (
    event.getTime() <=
    now.getTime()
  ) {
    const nextMonth = month + 1
    const nextYear =
      nextMonth > 11
        ? year + 1
        : year

    const actualMonth =
      nextMonth > 11
        ? 0
        : nextMonth

    firstFriday = 1

    while (
      new Date(
        Date.UTC(
          nextYear,
          actualMonth,
          firstFriday
        )
      ).getUTCDay() !== 5
    ) {
      firstFriday += 1
    }

    event = new Date(
      Date.UTC(
        nextYear,
        actualMonth,
        firstFriday,
        13,
        30,
        0
      )
    )
  }

  return event
}

function getNfpStatus(now: number) {
  const event = getNextNfpEvent()

  const difference =
    event.getTime() - now

  const oneHour =
    60 * 60 * 1000

  return {
    event,
    active:
      difference <= oneHour &&
      difference > -oneHour,
    difference,
  }
}

function formatCountdown(
  target: number,
  now: number
) {
  const difference = Math.max(
    0,
    target - now
  )

  const totalSeconds =
    Math.floor(
      difference / 1000
    )

  const hours =
    Math.floor(
      totalSeconds / 3600
    )

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    )

  const seconds =
    totalSeconds % 60

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

function isValidTimeframe(
  value: unknown
): value is Timeframe {
  return (
    typeof value === "string" &&
    TIMEFRAMES.some(
      (item) =>
        item.value === value
    )
  )
}

export default function DemoPage() {
  const [storageLoaded, setStorageLoaded] =
    useState(false)

  const [loggedIn, setLoggedIn] =
    useState(false)

  const [username, setUsername] =
    useState("")

  const [broker, setBroker] =
    useState("KG Brokers")

  const [selectedLeverage, setSelectedLeverage] =
    useState(
      DEFAULT_DEMO_LEVERAGE
    )

  const [startingCapital, setStartingCapital] =
    useState(
      DEFAULT_STARTING_CAPITAL
    )

  const [timeframe, setTimeframe] =
    useState<Timeframe>("1m")

  const [marketId, setMarketId] =
    useState(
      demoMarkets[0]?.id ?? ""
    )

  const [markets, setMarkets] =
    useState<ContinuousMarket[]>(
      () => createFreshMarkets("1m")
    )

  const [balance, setBalance] =
    useState(
      DEFAULT_STARTING_CAPITAL
    )

  const [positions, setPositions] =
    useState<Position[]>([])

  const [history, setHistory] =
    useState<ClosedTrade[]>([])

  const [nextPositionId, setNextPositionId] =
    useState(1)

  const [lotSize, setLotSize] =
    useState(
      DEFAULT_DEMO_LOT_SIZE
    )

  const [stopLoss, setStopLoss] =
    useState("")

  const [takeProfit, setTakeProfit] =
    useState("")

  const [depositAmount, setDepositAmount] =
    useState("")

  const [depositMessage, setDepositMessage] =
    useState("")

  const [closeMessage, setCloseMessage] =
    useState("")

  const [accountFailed, setAccountFailed] =
    useState(false)

  const [activeTab, setActiveTab] =
    useState<
      "positions" | "history"
    >("positions")

  const [clock, setClock] =
    useState(Date.now())

  /*
   * SETTINGS
   */
  const [confirmOrders, setConfirmOrders] =
    useState(true)

  const [showGrid, setShowGrid] =
    useState(true)

  const [autoScrollChart, setAutoScrollChart] =
    useState(true)

  const [notifications, setNotifications] =
    useState(true)

  /*
   * NOTIFICATION SYSTEM
   */
  const [notificationList, setNotificationList] =
    useState<DemoNotification[]>([])

  const [notification, setNotification] =
    useState("")

  const notificationIdRef =
    useRef(1)

  const notificationTimerRef =
    useRef<number | null>(null)

  const chartContainerRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const chartRef =
    useRef<IChartApi | null>(null)

  const seriesRef =
    useRef<
      ISeriesApi<"Candlestick"> | null
    >(null)

  const positionsRef =
    useRef<Position[]>([])

  positionsRef.current =
    positions

  /*
   * SHOW NOTIFICATION
   */
  function showNotification(
    message: string
  ) {
    if (!notifications) {
      return
    }

    setNotification(message)

    if (
      notificationTimerRef.current
    ) {
      window.clearTimeout(
        notificationTimerRef.current
      )
    }

    notificationTimerRef.current =
      window.setTimeout(() => {
        setNotification("")
      }, 3500)
  }

  /*
   * ADD DETAILED NOTIFICATION
   */
  function addNotification(
    type: NotificationType,
    title: string,
    message: string
  ) {
    if (!notifications) {
      return
    }

    const id =
      notificationIdRef.current

    notificationIdRef.current += 1

    const newNotification:
      DemoNotification = {
      id,
      type,
      title,
      message,
      createdAt: Date.now(),
    }

    setNotificationList(
      (current) => [
        newNotification,
        ...current,
      ].slice(0, 8)
    )

    showNotification(
      `${title}: ${message}`
    )

    window.setTimeout(() => {
      setNotificationList(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      )
    }, 7000)
  }

  /*
   * LOAD SETTINGS
   */
  useEffect(() => {
    try {
      const savedSettings =
        window.localStorage.getItem(
          SETTINGS_STORAGE_KEY
        )

      if (!savedSettings) {
        return
      }

      const settings =
        JSON.parse(savedSettings)

      if (
        typeof settings.defaultLotSize ===
          "number" &&
        Number.isFinite(
          settings.defaultLotSize
        ) &&
        settings.defaultLotSize > 0
      ) {
        setLotSize(
          settings.defaultLotSize
        )
      }

      if (
        typeof settings.defaultLeverage ===
          "number" &&
        LEVERAGES.includes(
          settings.defaultLeverage
        )
      ) {
        setSelectedLeverage(
          settings.defaultLeverage
        )
      }

      if (
        typeof settings.confirmOrders ===
        "boolean"
      ) {
        setConfirmOrders(
          settings.confirmOrders
        )
      }

      if (
        typeof settings.showGrid ===
        "boolean"
      ) {
        setShowGrid(
          settings.showGrid
        )
      }

      if (
        typeof settings.autoScrollChart ===
        "boolean"
      ) {
        setAutoScrollChart(
          settings.autoScrollChart
        )
      }

      if (
        typeof settings.notifications ===
        "boolean"
      ) {
        setNotifications(
          settings.notifications
        )
      }
    } catch (error) {
      console.error(
        "MSA 26 settings restore failed:",
        error
      )
    }
  }, [])

  /*
   * CLEAN NOTIFICATION TIMER
   */
  useEffect(() => {
    return () => {
      if (
        notificationTimerRef.current
      ) {
        window.clearTimeout(
          notificationTimerRef.current
        )
      }
    }
  }, [])

  /*
   * PERSISTENCE REF
   */
  const persistenceRef =
    useRef({
      loggedIn,
      username,
      broker,
      selectedLeverage,
      startingCapital,
      timeframe,
      marketId,
      markets,
      balance,
      positions,
      history,
      nextPositionId,
      lotSize,
      stopLoss,
      takeProfit,
      depositAmount,
      depositMessage,
      closeMessage,
      accountFailed,
      activeTab,
      confirmOrders,
      showGrid,
      autoScrollChart,
      notifications,
    })

  persistenceRef.current = {
    loggedIn,
    username,
    broker,
    selectedLeverage,
    startingCapital,
    timeframe,
    marketId,
    markets,
    balance,
    positions,
    history,
    nextPositionId,
    lotSize,
    stopLoss,
    takeProfit,
    depositAmount,
    depositMessage,
    closeMessage,
    accountFailed,
    activeTab,
    confirmOrders,
    showGrid,
    autoScrollChart,
    notifications,
  }

  /*
   * RESTORE DEMO ACCOUNT
   */
  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          DEMO_STORAGE_KEY
        )

      if (!saved) {
        setStorageLoaded(true)
        return
      }

      const data =
        JSON.parse(saved)

      if (
        !data ||
        data.version !== 1
      ) {
        setStorageLoaded(true)
        return
      }

      if (
        typeof data.username ===
        "string"
      ) {
        setUsername(
          data.username
        )
      }

      if (
        typeof data.broker ===
          "string" &&
        BROKERS.includes(
          data.broker
        )
      ) {
        setBroker(
          data.broker
        )
      }

      if (
        typeof data.selectedLeverage ===
          "number" &&
        LEVERAGES.includes(
          data.selectedLeverage
        )
      ) {
        setSelectedLeverage(
          data.selectedLeverage
        )
      }

      if (
        typeof data.startingCapital ===
          "number" &&
        Number.isFinite(
          data.startingCapital
        )
      ) {
        setStartingCapital(
          data.startingCapital
        )
      }

      const restoredTimeframe =
        isValidTimeframe(
          data.timeframe
        )
          ? data.timeframe
          : "1m"

      setTimeframe(
        restoredTimeframe
      )

      if (
        Array.isArray(
          data.markets
        ) &&
        data.markets.length > 0
      ) {
        setMarkets(
          data.markets
        )

        const restoredMarketId =
          typeof data.marketId ===
          "string"
            ? data.marketId
            : data.markets[0]?.id

        const marketExists =
          data.markets.some(
            (
              market: ContinuousMarket
            ) =>
              market.id ===
              restoredMarketId
          )

        setMarketId(
          marketExists
            ? restoredMarketId
            : data.markets[0]
                ?.id ?? ""
        )
      } else {
        const freshMarkets =
          createFreshMarkets(
            restoredTimeframe
          )

        setMarkets(
          freshMarkets
        )

        setMarketId(
          freshMarkets[0]?.id ??
            ""
        )
      }

      if (
        typeof data.balance ===
          "number" &&
        Number.isFinite(
          data.balance
        )
      ) {
        setBalance(
          data.balance
        )
      }

      if (
        Array.isArray(
          data.positions
        )
      ) {
        setPositions(
          data.positions
        )
      }

      if (
        Array.isArray(
          data.history
        )
      ) {
        setHistory(
          data.history
        )
      }

      if (
        typeof data.nextPositionId ===
        "number"
      ) {
        setNextPositionId(
          data.nextPositionId
        )
      }

      if (
        typeof data.lotSize ===
          "number" &&
        Number.isFinite(
          data.lotSize
        ) &&
        data.lotSize > 0
      ) {
        setLotSize(
          data.lotSize
        )
      }

      if (
        typeof data.stopLoss ===
        "string"
      ) {
        setStopLoss(
          data.stopLoss
        )
      }

      if (
        typeof data.takeProfit ===
        "string"
      ) {
        setTakeProfit(
          data.takeProfit
        )
      }

      if (
        typeof data.depositAmount ===
        "string"
      ) {
        setDepositAmount(
          data.depositAmount
        )
      }

      if (
        typeof data.depositMessage ===
        "string"
      ) {
        setDepositMessage(
          data.depositMessage
        )
      }

      if (
        typeof data.closeMessage ===
        "string"
      ) {
        setCloseMessage(
          data.closeMessage
        )
      }

      if (
        typeof data.confirmOrders ===
        "boolean"
      ) {
        setConfirmOrders(
          data.confirmOrders
        )
      }

      if (
        typeof data.showGrid ===
        "boolean"
      ) {
        setShowGrid(
          data.showGrid
        )
      }

      if (
        typeof data.autoScrollChart ===
        "boolean"
      ) {
        setAutoScrollChart(
          data.autoScrollChart
        )
      }

      if (
        typeof data.notifications ===
        "boolean"
      ) {
        setNotifications(
          data.notifications
        )
      }

      setAccountFailed(
        Boolean(
          data.accountFailed
        )
      )

      if (
        data.activeTab ===
          "positions" ||
        data.activeTab ===
          "history"
      ) {
        setActiveTab(
          data.activeTab
        )
      }

      setLoggedIn(
        Boolean(data.loggedIn)
      )
    } catch (error) {
      console.error(
        "MSA 26 demo restore failed:",
        error
      )
    } finally {
      setStorageLoaded(true)
    }
  }, [])

  /*
   * SAVE DEMO STATE
   */
  useEffect(() => {
    if (!storageLoaded) {
      return
    }

    const save = () => {
      try {
        const current =
          persistenceRef.current

        if (!current.loggedIn) {
          return
        }

        window.localStorage.setItem(
          DEMO_STORAGE_KEY,
          JSON.stringify({
            version: 1,
            ...current,
          })
        )
      } catch (error) {
        console.error(
          "MSA 26 demo save failed:",
          error
        )
      }
    }

    save()

    const interval =
      window.setInterval(
        save,
        2000
      )

    const handleBeforeUnload =
      () => {
        save()
      }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    )

    return () => {
      window.clearInterval(
        interval
      )

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      )
    }
  }, [storageLoaded])

  const selectedMarket =
    markets.find(
      (item) =>
        item.id === marketId
    ) ?? null

  /*
   * CLOCK
   */
  useEffect(() => {
    if (!loggedIn) {
      return
    }

    const interval =
      window.setInterval(() => {
        setClock(Date.now())
      }, 1000)

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [loggedIn])

  const nfpStatus =
    useMemo(
      () =>
        getNfpStatus(clock),
      [clock]
    )

  /*
   * NFP NOTIFICATION
   */
  const previousNfpActiveRef =
    useRef(false)

  useEffect(() => {
    if (
      !loggedIn ||
      !selectedMarket ||
      selectedMarket.category !==
        "nfp"
    ) {
      previousNfpActiveRef.current =
        false
      return
    }

    if (
      nfpStatus.active &&
      !previousNfpActiveRef.current
    ) {
      addNotification(
        "warning",
        "NFP Event Active",
        "The simulated NFP market is now in its high-volatility period."
      )
    }

    previousNfpActiveRef.current =
      nfpStatus.active
  }, [
    loggedIn,
    selectedMarket?.id,
    nfpStatus.active,
  ])

  /*
   * ENTER DEMO
   */
  function enterDemo() {
    const cleanUsername =
      username.trim()

    if (!cleanUsername) {
      alert(
        "Please enter a username."
      )
      return
    }

    if (
      !Number.isFinite(
        startingCapital
      ) ||
      startingCapital < 10
    ) {
      alert(
        "Starting virtual capital must be at least $10."
      )
      return
    }

    const freshMarkets =
      createFreshMarkets(
        timeframe
      )

    const firstMarket =
      freshMarkets[0]

    try {
      window.localStorage.removeItem(
        DEMO_STORAGE_KEY
      )
    } catch {
      // Ignore storage errors.
    }

    setBalance(
      startingCapital
    )

    setPositions([])
    setHistory([])
    setNextPositionId(1)

    setDepositAmount("")
    setDepositMessage("")
    setCloseMessage("")
    setNotificationList([])

    setAccountFailed(false)

    setMarkets(
      freshMarkets
    )

    setMarketId(
      firstMarket?.id ?? ""
    )

    setLoggedIn(true)

    addNotification(
      "success",
      "Demo Account Created",
      `${broker} account created with ${formatMoney(
        startingCapital
      )} virtual capital.`
    )
  }

  /*
   * CHANGE TIMEFRAME
   */
  function changeTimeframe(
    nextTimeframe: Timeframe
  ) {
    if (
      nextTimeframe ===
      timeframe
    ) {
      return
    }

    const currentSymbol =
      selectedMarket?.symbol

    const freshMarkets =
      createFreshMarkets(
        nextTimeframe
      )

    setTimeframe(
      nextTimeframe
    )

    setMarkets(
      freshMarkets
    )

    const matchingMarket =
      freshMarkets.find(
        (market) =>
          market.symbol ===
          currentSymbol
      )

    setMarketId(
      matchingMarket?.id ??
        freshMarkets[0]?.id ??
        ""
    )

    const label =
      TIMEFRAMES.find(
        (item) =>
          item.value ===
          nextTimeframe
      )?.label ?? nextTimeframe

    addNotification(
      "info",
      "Timeframe Changed",
      `Chart timeframe changed to ${label}.`
    )
  }

  /*
   * LOGOUT
   */
  function logout() {
    try {
      window.localStorage.removeItem(
        DEMO_STORAGE_KEY
      )
    } catch {
      // Ignore storage errors.
    }

    setLoggedIn(false)
    setUsername("")
    setPositions([])
    setHistory([])
    setBalance(
      DEFAULT_STARTING_CAPITAL
    )
    setStartingCapital(
      DEFAULT_STARTING_CAPITAL
    )
    setNextPositionId(1)

    setDepositAmount("")
    setDepositMessage("")
    setCloseMessage("")
    setNotification("")
    setNotificationList([])

    setAccountFailed(false)

    const freshMarkets =
      createFreshMarkets(
        timeframe
      )

    setMarkets(
      freshMarkets
    )

    setMarketId(
      freshMarkets[0]?.id ??
        ""
    )
  }

  /*
   * TRY AGAIN
   */
  function tryAgain() {
    try {
      window.localStorage.removeItem(
        DEMO_STORAGE_KEY
      )
    } catch {
      // Ignore storage errors.
    }

    setLoggedIn(false)
    setPositions([])
    setHistory([])
    setBalance(
      DEFAULT_STARTING_CAPITAL
    )
    setStartingCapital(
      DEFAULT_STARTING_CAPITAL
    )
    setNextPositionId(1)

    setDepositAmount("")
    setDepositMessage("")
    setCloseMessage("")
    setNotification("")
    setNotificationList([])

    setAccountFailed(false)

    const freshMarkets =
      createFreshMarkets(
        timeframe
      )

    setMarkets(
      freshMarkets
    )

    setMarketId(
      freshMarkets[0]?.id ??
        ""
    )
  }

  /*
   * VIRTUAL DEPOSIT
   */
  function makeDeposit() {
    const amount =
      Number(
        depositAmount
      )

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      setDepositMessage(
        "Enter a valid virtual deposit amount."
      )

      addNotification(
        "warning",
        "Deposit Not Added",
        "Enter a valid virtual deposit amount."
      )

      return
    }

    setBalance(
      (current) =>
        current + amount
    )

    setDepositAmount("")

    const message =
      `${formatMoney(
        amount
      )} virtual money added to your demo account.`

    setDepositMessage(
      message
    )

    addNotification(
      "success",
      "Virtual Deposit",
      message
    )
  }

  /*
   * MARKET ENGINE
   */
  useEffect(() => {
    if (
      !loggedIn ||
      accountFailed ||
      markets.length === 0
    ) {
      return
    }

    const intervalMs =
      selectedMarket
        ? getMarketUpdateInterval(
            selectedMarket
          )
        : 1000

    const interval =
      window.setInterval(
        () => {
          setMarkets(
            (currentMarkets) =>
              currentMarkets.map(
                (market) => {
                  const nextMarket =
                    cloneMarket(
                      market
                    )

                  updateMarket(
                    nextMarket
                  )

                  return nextMarket
                }
              )
          )
        },
        intervalMs
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [
    loggedIn,
    accountFailed,
    selectedMarket?.id,
    markets.length,
  ])

  /*
   * UPDATE FLOATING P/L
   * AND AUTOMATIC SL / TP
   */
  useEffect(() => {
    if (
      !loggedIn ||
      accountFailed ||
      positions.length === 0
    ) {
      return
    }

    const updatedPositions =
      positions.map(
        (position) => {
          const market =
            markets.find(
              (item) =>
                item.id ===
                position.marketId
            )

          if (!market) {
            return position
          }

          const bid =
            getBidPrice(
              market
            )

          const ask =
            getAskPrice(
              market
            )

          const exitPrice =
            position.side ===
            "BUY"
              ? bid
              : ask

          const contractSize =
            getContractSize(
              position.category
            )

          const direction =
            position.side ===
            "BUY"
              ? 1
              : -1

          const pnl =
            (exitPrice -
              position.entryPrice) *
            contractSize *
            position.lotSize *
            direction

          let shouldClose =
            false

          let closeReason = ""

          if (
            position.stopLoss !==
            null
          ) {
            if (
              position.side ===
                "BUY" &&
              exitPrice <=
                position.stopLoss
            ) {
              shouldClose = true
              closeReason =
                "Stop Loss"
            }

            if (
              position.side ===
                "SELL" &&
              exitPrice >=
                position.stopLoss
            ) {
              shouldClose = true
              closeReason =
                "Stop Loss"
            }
          }

          if (
            position.takeProfit !==
            null
          ) {
            if (
              position.side ===
                "BUY" &&
              exitPrice >=
                position.takeProfit
            ) {
              shouldClose = true
              closeReason =
                "Take Profit"
            }

            if (
              position.side ===
                "SELL" &&
              exitPrice <=
                position.takeProfit
            ) {
              shouldClose = true
              closeReason =
                "Take Profit"
            }
          }

          if (shouldClose) {
            const closedTrade:
              ClosedTrade = {
              id: position.id,
              marketId:
                position.marketId,
              symbol:
                position.symbol,
              category:
                position.category,
              side:
                position.side,
              lotSize:
                position.lotSize,
              entryPrice:
                position.entryPrice,
              exitPrice,
              profitLoss:
                pnl,
              openedAt:
                position.openedAt,
              closedAt:
                Date.now(),
              closeReason,
            }

            setHistory(
              (current) => [
                closedTrade,
                ...current,
              ]
            )

            setBalance(
              (current) =>
                current + pnl
            )

            addNotification(
              pnl >= 0
                ? "success"
                : "danger",
              closeReason,
              `${position.symbol} ${
                position.side
              } closed at ${formatPrice(
                exitPrice,
                position.category
              )} for ${
                pnl >= 0 ? "+" : ""
              }${formatMoney(pnl)}.`
            )

            return null
          }

          return {
            ...position,
            currentPrice:
              exitPrice,
            unrealizedPnl:
              pnl,
          }
        }
      )

    setPositions(
      updatedPositions.filter(
        (
          position
        ): position is Position =>
          position !== null
      )
    )
  }, [
    markets,
    loggedIn,
    accountFailed,
  ])

  /*
   * ACCOUNT VALUES
   */
  const usedMargin =
    positions.reduce(
      (total, position) =>
        total +
        position.margin,
      0
    )

  const unrealizedPnl =
    positions.reduce(
      (total, position) =>
        total +
        position.unrealizedPnl,
      0
    )

  const equity =
    balance +
    unrealizedPnl

  const availableMargin =
    equity -
    usedMargin

  /*
   * ACCOUNT FAILURE
   */
  useEffect(() => {
    if (
      !loggedIn ||
      accountFailed
    ) {
      return
    }

    if (
      equity <= 0 ||
      balance <= 0
    ) {
      if (
        positions.length > 0
      ) {
        const closedTrades =
          positions.map(
            (position) => {
              const market =
                markets.find(
                  (item) =>
                    item.id ===
                    position.marketId
                )

              const exitPrice =
                market
                  ? position.side ===
                    "BUY"
                    ? getBidPrice(
                        market
                      )
                    : getAskPrice(
                        market
                      )
                  : position.currentPrice

              const contractSize =
                getContractSize(
                  position.category
                )

              const direction =
                position.side ===
                "BUY"
                  ? 1
                  : -1

              const profitLoss =
                (exitPrice -
                  position.entryPrice) *
                contractSize *
                position.lotSize *
                direction

              return {
                id: position.id,
                marketId:
                  position.marketId,
                symbol:
                  position.symbol,
                category:
                  position.category,
                side:
                  position.side,
                lotSize:
                  position.lotSize,
                entryPrice:
                  position.entryPrice,
                exitPrice,
                profitLoss,
                openedAt:
                  position.openedAt,
                closedAt:
                  Date.now(),
                closeReason:
                  "Account Failure",
              }
            }
          )

        setHistory(
          (current) => [
            ...closedTrades,
            ...current,
          ]
        )

        setPositions([])

        addNotification(
          "danger",
          "Account Failure",
          "All open virtual positions were closed because account equity reached zero."
        )
      }

      setAccountFailed(true)

      addNotification(
        "danger",
        "Demo Account Failed",
        "Virtual equity reached zero."
      )
    }
  }, [
    equity,
    balance,
    positions,
    markets,
    loggedIn,
    accountFailed,
  ])

  /*
   * CREATE CHART
   */
  useEffect(() => {
    if (
      !loggedIn ||
      !chartContainerRef.current ||
      !selectedMarket
    ) {
      return
    }

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      seriesRef.current =
        null
    }

    const container =
      chartContainerRef.current

    const gridColor =
      showGrid
        ? "#1e293b"
        : "transparent"

    const chart =
      createChart(
        container,
        {
          width:
            container.clientWidth,
          height: 430,

          layout: {
            background: {
              color:
                "#020617",
            },
            textColor:
              "#94a3b8",
          },

          grid: {
            vertLines: {
              color:
                gridColor,
            },
            horzLines: {
              color:
                gridColor,
            },
          },

          rightPriceScale: {
            borderColor:
              "#334155",
          },

          timeScale: {
            borderColor:
              "#334155",
            timeVisible:
              true,
            secondsVisible:
              false,
          },
        }
      )

    const series =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor:
            "#22c55e",
          downColor:
            "#ef4444",
          borderUpColor:
            "#22c55e",
          borderDownColor:
            "#ef4444",
          wickUpColor:
            "#22c55e",
          wickDownColor:
            "#ef4444",
        }
      )

    series.setData(
      selectedMarket.candles.map(
        (candle) => ({
          time:
            Math.floor(
              candle.time / 1000
            ) as Time,
          open:
            candle.open,
          high:
            candle.high,
          low:
            candle.low,
          close:
            candle.close,
        })
      )
    )

    if (autoScrollChart) {
      chart
        .timeScale()
        .fitContent()
    }

    chartRef.current =
      chart

    seriesRef.current =
      series

    const handleResize =
      () => {
        if (
          !chartContainerRef.current
        ) {
          return
        }

        chart.applyOptions({
          width:
            chartContainerRef
              .current
              .clientWidth,
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

      if (
        chartRef.current ===
        chart
      ) {
        chartRef.current =
          null

        seriesRef.current =
          null
      }
    }
  }, [
    loggedIn,
    marketId,
    timeframe,
    showGrid,
  ])

  /*
   * LIVE CHART CANDLE UPDATE
   */
  useEffect(() => {
    if (
      !seriesRef.current ||
      !selectedMarket ||
      selectedMarket.candles
        .length === 0
    ) {
      return
    }

    const candle =
      selectedMarket.candles[
        selectedMarket.candles
          .length - 1
      ]

    seriesRef.current.update({
      time:
        Math.floor(
          candle.time / 1000
        ) as Time,
      open:
        candle.open,
      high:
        candle.high,
      low:
        candle.low,
      close:
        candle.close,
    })

    if (
      autoScrollChart &&
      chartRef.current
    ) {
      chartRef.current
        .timeScale()
        .scrollToRealTime()
    }
  }, [
    selectedMarket?.candles,
    autoScrollChart,
  ])

  /*
   * CLEAN CHART WHEN LOGGING OUT
   */
  useEffect(() => {
    if (loggedIn) {
      return
    }

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current =
        null
      seriesRef.current =
        null
    }
  }, [loggedIn])

  const bid =
    selectedMarket
      ? getBidPrice(
          selectedMarket
        )
      : 0

  const ask =
    selectedMarket
      ? getAskPrice(
          selectedMarket
        )
      : 0

  /*
   * OPEN TRADE
   */
  function openTrade(
    side: Side
  ) {
    if (
      !selectedMarket ||
      accountFailed
    ) {
      return
    }

    const parsedLotSize =
      Number(lotSize)

    if (
      !Number.isFinite(
        parsedLotSize
      ) ||
      parsedLotSize <= 0
    ) {
      setCloseMessage(
        "Enter a valid lot size."
      )

      addNotification(
        "warning",
        "Invalid Lot Size",
        "Enter a valid virtual lot size."
      )

      return
    }

    const parsedStopLoss =
      stopLoss.trim() === ""
        ? null
        : Number(stopLoss)

    const parsedTakeProfit =
      takeProfit.trim() === ""
        ? null
        : Number(takeProfit)

    if (
      parsedStopLoss !== null &&
      !Number.isFinite(
        parsedStopLoss
      )
    ) {
      setCloseMessage(
        "Stop Loss must be a valid price."
      )

      addNotification(
        "warning",
        "Invalid Stop Loss",
        "Enter a valid simulated price."
      )

      return
    }

    if (
      parsedTakeProfit !== null &&
      !Number.isFinite(
        parsedTakeProfit
      )
    ) {
      setCloseMessage(
        "Take Profit must be a valid price."
      )

      addNotification(
        "warning",
        "Invalid Take Profit",
        "Enter a valid simulated price."
      )

      return
    }

    const entryPrice =
      side === "BUY"
        ? ask
        : bid

    if (
      side === "BUY" &&
      parsedStopLoss !== null &&
      parsedStopLoss >=
        entryPrice
    ) {
      setCloseMessage(
        "For a BUY, Stop Loss must be below the entry price."
      )

      addNotification(
        "warning",
        "Invalid Stop Loss",
        "A BUY Stop Loss must be below the entry price."
      )

      return
    }

    if (
      side === "BUY" &&
      parsedTakeProfit !== null &&
      parsedTakeProfit <=
        entryPrice
    ) {
      setCloseMessage(
        "For a BUY, Take Profit must be above the entry price."
      )

      addNotification(
        "warning",
        "Invalid Take Profit",
        "A BUY Take Profit must be above the entry price."
      )

      return
    }

    if (
      side === "SELL" &&
      parsedStopLoss !== null &&
      parsedStopLoss <=
        entryPrice
    ) {
      setCloseMessage(
        "For a SELL, Stop Loss must be above the entry price."
      )

      addNotification(
        "warning",
        "Invalid Stop Loss",
        "A SELL Stop Loss must be above the entry price."
      )

      return
    }

    if (
      side === "SELL" &&
      parsedTakeProfit !== null &&
      parsedTakeProfit >=
        entryPrice
    ) {
      setCloseMessage(
        "For a SELL, Take Profit must be below the entry price."
      )

      addNotification(
        "warning",
        "Invalid Take Profit",
        "A SELL Take Profit must be below the entry price."
      )

      return
    }

    const contractSize =
      getContractSize(
        selectedMarket.category
      )

    const positionValue =
      entryPrice *
      contractSize *
      parsedLotSize

    const margin =
      positionValue /
      selectedLeverage

    if (
      margin >
      availableMargin
    ) {
      setCloseMessage(
        "Not enough available virtual margin."
      )

      addNotification(
        "danger",
        "Insufficient Virtual Margin",
        "The simulated order requires more available margin."
      )

      return
    }

    /*
     * CONFIRM ORDERS SETTING
     */
    if (confirmOrders) {
      const confirmed =
        window.confirm(
          `Open simulated ${side} position?\n\n` +
            `Market: ${selectedMarket.symbol}\n` +
            `Price: ${formatPrice(
              entryPrice,
              selectedMarket.category
            )}\n` +
            `Lot size: ${parsedLotSize}\n` +
            `Leverage: 1:${selectedLeverage}`
        )

      if (!confirmed) {
        setCloseMessage(
          "Order cancelled."
        )

        addNotification(
          "info",
          "Order Cancelled",
          `The simulated ${side} order was cancelled.`
        )

        return
      }
    }

    const position:
      Position = {
      id: nextPositionId,
      marketId:
        selectedMarket.id,
      symbol:
        selectedMarket.symbol,
      category:
        selectedMarket.category,
      side,
      lotSize:
        parsedLotSize,
      leverage:
        selectedLeverage,
      entryPrice,
      currentPrice:
        entryPrice,
      stopLoss:
        parsedStopLoss,
      takeProfit:
        parsedTakeProfit,
      openedAt:
        Date.now(),
      unrealizedPnl: 0,
      margin,
    }

    setPositions(
      (current) => [
        ...current,
        position,
      ]
    )

    setNextPositionId(
      (current) =>
        current + 1
    )

    setStopLoss("")
    setTakeProfit("")

    const message =
      `${side} position opened at ${formatPrice(
        entryPrice,
        selectedMarket.category
      )}.`

    setCloseMessage(
      message
    )

    addNotification(
      "success",
      `${side} Position Opened`,
      `${selectedMarket.symbol} opened at ${formatPrice(
        entryPrice,
        selectedMarket.category
      )} with ${parsedLotSize} lots.`
    )
  }

  /*
   * CALCULATE POSITION CLOSE
   */
  function calculatePositionClose(
    position: Position
  ) {
    const market =
      markets.find(
        (item) =>
          item.id ===
          position.marketId
      )

    if (!market) {
      return {
        exitPrice:
          position.currentPrice,
        profitLoss:
          position.unrealizedPnl,
      }
    }

    const exitPrice =
      position.side === "BUY"
        ? getBidPrice(
            market
          )
        : getAskPrice(
            market
          )

    const contractSize =
      getContractSize(
        position.category
      )

    const direction =
      position.side ===
      "BUY"
        ? 1
        : -1

    const profitLoss =
      (exitPrice -
        position.entryPrice) *
      contractSize *
      position.lotSize *
      direction

    return {
      exitPrice,
      profitLoss,
    }
  }

  /*
   * CLOSE ONE POSITION
   */
  function closePosition(
    positionId: number
  ) {
    const position =
      positions.find(
        (item) =>
          item.id ===
          positionId
      )

    if (!position) {
      return
    }

    const result =
      calculatePositionClose(
        position
      )

    const trade:
      ClosedTrade = {
      id: position.id,
      marketId:
        position.marketId,
      symbol:
        position.symbol,
      category:
        position.category,
      side:
        position.side,
      lotSize:
        position.lotSize,
      entryPrice:
        position.entryPrice,
      exitPrice:
        result.exitPrice,
      profitLoss:
        result.profitLoss,
      openedAt:
        position.openedAt,
      closedAt:
        Date.now(),
      closeReason:
        "Manual Close",
    }

    setHistory(
      (current) => [
        trade,
        ...current,
      ]
    )

    setBalance(
      (current) =>
        current +
        result.profitLoss
    )

    setPositions(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            positionId
        )
    )

    const message =
      `Position closed: ${
        result.profitLoss >=
        0
          ? "+"
          : ""
      }${formatMoney(
        result.profitLoss
      )}`

    setCloseMessage(
      message
    )

    addNotification(
      result.profitLoss >=
        0
        ? "success"
        : "danger",
      "Position Closed",
      `${position.symbol} closed for ${
        result.profitLoss >= 0
          ? "+"
          : ""
      }${formatMoney(
        result.profitLoss
      )}.`
    )
  }

  /*
   * CLOSE WINNERS
   */
  function closeWinningPositions() {
    const winners =
      positions.filter(
        (position) =>
          position.unrealizedPnl >
          0
      )

    if (
      winners.length === 0
    ) {
      setCloseMessage(
        "There are no currently profitable positions."
      )

      addNotification(
        "info",
        "No Winning Positions",
        "There are no currently profitable virtual positions."
      )

      return
    }

    let totalProfit = 0

    const trades =
      winners.map(
        (position) => {
          const result =
            calculatePositionClose(
              position
            )

          totalProfit +=
            result.profitLoss

          return {
            id: position.id,
            marketId:
              position.marketId,
            symbol:
              position.symbol,
            category:
              position.category,
            side:
              position.side,
            lotSize:
              position.lotSize,
            entryPrice:
              position.entryPrice,
            exitPrice:
              result.exitPrice,
            profitLoss:
              result.profitLoss,
            openedAt:
              position.openedAt,
            closedAt:
              Date.now(),
            closeReason:
              "Close Winners",
          }
        }
      )

    setHistory(
      (current) => [
        ...trades,
        ...current,
      ]
    )

    setBalance(
      (current) =>
        current +
        totalProfit
    )

    const winnerIds =
      new Set(
        winners.map(
          (position) =>
            position.id
        )
      )

    setPositions(
      (current) =>
        current.filter(
          (position) =>
            !winnerIds.has(
              position.id
            )
        )
    )

    const message =
      `Closed ${
        winners.length
      } profitable position${
        winners.length ===
        1
          ? ""
          : "s"
      }: ${
        totalProfit >= 0
          ? "+"
          : ""
      }${formatMoney(
        totalProfit
      )}`

    setCloseMessage(
      message
    )

    addNotification(
      "success",
      "Winning Positions Closed",
      `${winners.length} profitable position${
        winners.length === 1
          ? ""
          : "s"
      } closed for ${
        totalProfit >= 0
          ? "+"
          : ""
      }${formatMoney(
        totalProfit
      )}.`
    )
  }

  /*
   * CLOSE ALL
   */
  function closeAllPositions() {
    if (
      positions.length === 0
    ) {
      setCloseMessage(
        "There are no open positions."
      )

      addNotification(
        "info",
        "No Open Positions",
        "There are no virtual positions to close."
      )

      return
    }

    let totalProfit = 0

    const trades =
      positions.map(
        (position) => {
          const result =
            calculatePositionClose(
              position
            )

          totalProfit +=
            result.profitLoss

          return {
            id: position.id,
            marketId:
              position.marketId,
            symbol:
              position.symbol,
            category:
              position.category,
            side:
              position.side,
            lotSize:
              position.lotSize,
            entryPrice:
              position.entryPrice,
            exitPrice:
              result.exitPrice,
            profitLoss:
              result.profitLoss,
            openedAt:
              position.openedAt,
            closedAt:
              Date.now(),
            closeReason:
              "Close All",
          }
        }
      )

    setHistory(
      (current) => [
        ...trades,
        ...current,
      ]
    )

    setBalance(
      (current) =>
        current +
        totalProfit
    )

    setPositions([])

    const message =
      `Closed all positions: ${
        totalProfit >= 0
          ? "+"
          : ""
      }${formatMoney(
        totalProfit
      )}`

    setCloseMessage(
      message
    )

    addNotification(
      totalProfit >= 0
        ? "success"
        : "danger",
      "All Positions Closed",
      `${positions.length} position${
        positions.length === 1
          ? ""
          : "s"
      } closed for ${
        totalProfit >= 0
          ? "+"
          : ""
      }${formatMoney(
        totalProfit
      )}.`
    )
  }

  /*
   * NOTIFICATION STYLES
   */
  function getNotificationStyles(
    type: NotificationType
  ) {
    switch (type) {
      case "success":
        return {
          border:
            "border-emerald-500/30",
          background:
            "bg-emerald-500/10",
          title:
            "text-emerald-400",
          icon: "✓",
        }

      case "warning":
        return {
          border:
            "border-amber-500/30",
          background:
            "bg-amber-500/10",
          title:
            "text-amber-400",
          icon: "!",
        }

      case "danger":
        return {
          border:
            "border-red-500/30",
          background:
            "bg-red-500/10",
          title:
            "text-red-400",
          icon: "×",
        }

      default:
        return {
          border:
            "border-blue-500/30",
          background:
            "bg-blue-500/10",
          title:
            "text-blue-400",
          icon: "i",
        }
    }
  }

  /*
   * RESTORE SCREEN
   */
  if (!storageLoaded) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-8 py-6 text-center">
            <div className="text-lg font-bold">
              Loading MSA 26...
            </div>

            <div className="mt-2 text-sm text-slate-400">
              Restoring your demo account
            </div>
          </div>
        </div>
      </main>
    )
  }

  /*
   * LOGIN SCREEN
   */
  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
          <header className="mb-10">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to MSA 26
            </Link>

            <div className="mt-8">
              <div className="mb-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                SIMULATED DEMO ACCOUNT
              </div>

              <h1 className="text-5xl font-black">
                MSA{" "}
                <span className="text-emerald-400">
                  26
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Practice trading with virtual
                money, simulated brokers and
                simulated markets. No real
                money is used.
              </p>
            </div>
          </header>

          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold">
              Create Demo Account
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your account is saved in this
              browser so refreshing the page
              will not reset your demo.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Username
                </label>

                <input
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Simulated Broker
                </label>

                <select
                  value={broker}
                  onChange={(event) =>
                    setBroker(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  {BROKERS.map(
                    (brokerName) => (
                      <option
                        key={
                          brokerName
                        }
                        value={
                          brokerName
                        }
                      >
                        {
                          brokerName
                        }
                        {brokerName ===
                        "KG Brokers"
                          ? " — Recommended"
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Virtual Starting Capital
                </label>

                <input
                  type="number"
                  min="10"
                  step="1"
                  value={
                    startingCapital
                  }
                  onChange={(event) =>
                    setStartingCapital(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    100,
                    500,
                    1000,
                    5000,
                    10000,
                    50000,
                  ].map(
                    (amount) => (
                      <button
                        key={
                          amount
                        }
                        type="button"
                        onClick={() =>
                          setStartingCapital(
                            amount
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm transition ${
                          startingCapital ===
                          amount
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        $
                        {amount.toLocaleString()}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Leverage
                </label>

                <select
                  value={
                    selectedLeverage
                  }
                  onChange={(event) =>
                    setSelectedLeverage(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  {LEVERAGES.map(
                    (leverage) => (
                      <option
                        key={
                          leverage
                        }
                        value={
                          leverage
                        }
                      >
                        1:
                        {
                          leverage
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Starting Chart Timeframe
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TIMEFRAMES.map(
                    (option) => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          setTimeframe(
                            option.value
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          timeframe ===
                          option.value
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {
                          option.shortLabel
                        }
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Broker
                    </div>

                    <div className="mt-1 font-semibold">
                      {broker}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Virtual Capital
                    </div>

                    <div className="mt-1 font-semibold text-emerald-400">
                      {formatMoney(
                        startingCapital
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Leverage
                    </div>

                    <div className="mt-1 font-semibold">
                      1:
                      {
                        selectedLeverage
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Default Lot Size
                    </div>

                    <div className="mt-1 font-semibold">
                      {lotSize}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Confirm Orders
                    </div>

                    <div className="mt-1 font-semibold">
                      {confirmOrders
                        ? "ON"
                        : "OFF"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Chart Grid
                    </div>

                    <div className="mt-1 font-semibold">
                      {showGrid
                        ? "ON"
                        : "OFF"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Auto Scroll
                    </div>

                    <div className="mt-1 font-semibold">
                      {autoScrollChart
                        ? "ON"
                        : "OFF"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Notifications
                    </div>

                    <div className="mt-1 font-semibold">
                      {notifications
                        ? "ON"
                        : "OFF"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Timeframe
                    </div>

                    <div className="mt-1 font-semibold">
                      {
                        TIMEFRAMES.find(
                          (item) =>
                            item.value ===
                            timeframe
                        )?.label
                      }
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  enterDemo
                }
                className="w-full rounded-xl bg-emerald-500 px-5 py-4 font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                ENTER TRADING DEMO
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  /*
   * ACCOUNT FAILURE
   */
  if (accountFailed) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-10">
          <div className="w-full rounded-3xl border border-red-500/30 bg-slate-900 p-10 text-center">
            <div className="text-5xl">
              ⚠
            </div>

            <h1 className="mt-5 text-4xl font-black text-red-400">
              DEMO ACCOUNT FAILED
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Your virtual account equity
              reached zero or your available
              balance was exhausted.
            </p>

            <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="text-sm text-slate-500">
                  Final Balance
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {formatMoney(
                    balance
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="text-sm text-slate-500">
                  Trades Closed
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {
                    history.length
                  }
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={
                  tryAgain
                }
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400"
              >
                CREATE NEW DEMO
              </button>

              <Link
                href="/"
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
              >
                BACK TO MSA 26
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!selectedMarket) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-slate-400">
            Loading simulated market...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        {/* HEADER */}
        <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-white"
              >
                ← MSA 26
              </Link>

              <span className="text-slate-700">
                |
              </span>

              <span className="text-sm font-semibold text-emerald-400">
                DEMO ACCOUNT
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black">
              {
                selectedMarket.symbol
              }
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {
                selectedMarket.name
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
              <div className="text-xs text-slate-500">
                USER
              </div>

              <div className="font-semibold">
                {username}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
              <div className="text-xs text-slate-500">
                BROKER
              </div>

              <div className="font-semibold">
                {broker}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
              <div className="text-xs text-slate-500">
                LEVERAGE
              </div>

              <div className="font-semibold">
                1:
                {
                  selectedLeverage
                }
              </div>
            </div>

            <Link
              href="/settings"
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400"
            >
              Settings
            </Link>

            <button
              type="button"
              onClick={
                logout
              }
              className="rounded-xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </header>

        {/* QUICK NOTIFICATION */}
        {notification && (
          <div className="fixed right-5 top-5 z-50 max-w-sm rounded-xl border border-emerald-500/30 bg-slate-900 px-5 py-4 text-sm font-semibold text-emerald-400 shadow-2xl">
            {notification}
          </div>
        )}

        {/* NOTIFICATION CENTER */}
        {notifications &&
          notificationList.length >
            0 && (
            <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Notifications
                  </div>

                  <div className="mt-1 text-sm font-semibold text-slate-300">
                    Recent demo activity
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationList(
                      []
                    )
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-500 hover:text-white"
                >
                  Clear
                </button>
              </div>

              <div className="grid gap-2">
                {notificationList.map(
                  (
                    item
                  ) => {
                    const styles =
                      getNotificationStyles(
                        item.type
                      )

                    return (
                      <div
                        key={
                          item.id
                        }
                        className={`flex gap-3 rounded-xl border ${styles.border} ${styles.background} px-4 py-3`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${styles.border} ${styles.title} font-black`}
                        >
                          {
                            styles.icon
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-bold ${styles.title}`}
                          >
                            {
                              item.title
                            }
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {
                              item.message
                            }
                          </div>

                          <div className="mt-1 text-[10px] text-slate-600">
                            {new Date(
                              item.createdAt
                            ).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </section>
          )}

        {/* NFP PANEL */}
        {selectedMarket.category ===
          "nfp" && (
          <section className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  HIGH VOLATILITY EVENT
                </div>

                <div className="mt-1 text-xl font-bold">
                  Non-Farm Payrolls Simulation
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  This simulated market becomes
                  more volatile around the
                  scheduled NFP event.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-slate-950 px-5 py-3 text-center">
                <div className="text-xs text-slate-500">
                  NEXT NFP EVENT
                </div>

                <div className="mt-1 font-mono text-xl font-bold text-amber-400">
                  {nfpStatus.active
                    ? "ACTIVE"
                    : formatCountdown(
                        nfpStatus.event.getTime(),
                        clock
                      )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MARKET / TIMEFRAME */}
        <section className="mb-5 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Simulated Market
            </div>

            <select
              value={marketId}
              onChange={(event) => {
                setMarketId(
                  event.target
                    .value
                )

                const nextMarket =
                  markets.find(
                    (market) =>
                      market.id ===
                      event.target
                        .value
                  )

                if (
                  nextMarket
                ) {
                  addNotification(
                    "info",
                    "Market Changed",
                    `Viewing ${nextMarket.symbol} — ${nextMarket.name}.`
                  )
                }
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-semibold text-white outline-none focus:border-emerald-500"
            >
              {markets.map(
                (market) => (
                  <option
                    key={
                      market.id
                    }
                    value={
                      market.id
                    }
                  >
                    {
                      market.symbol
                    }{" "}
                    —{" "}
                    {
                      market.name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Timeframe
            </div>

            <div className="flex flex-wrap gap-2">
              {TIMEFRAMES.map(
                (option) => (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      changeTimeframe(
                        option.value
                      )
                    }
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      timeframe ===
                      option.value
                        ? "bg-emerald-500 text-slate-950"
                        : "border border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {
                      option.shortLabel
                    }
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* MARKET INFO */}
        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Bid",
              value: formatPrice(
                bid,
                selectedMarket.category
              ),
              className:
                "text-red-400",
            },
            {
              label: "Ask",
              value: formatPrice(
                ask,
                selectedMarket.category
              ),
              className:
                "text-emerald-400",
            },
            {
              label: "Spread",
              value: formatPrice(
                ask - bid,
                selectedMarket.category
              ),
              className:
                "text-white",
            },
            {
              label: "Balance",
              value:
                formatMoney(
                  balance
                ),
              className:
                "text-white",
            },
            {
              label:
                "Virtual Capital",
              value:
                formatMoney(
                  startingCapital
                ),
              className:
                "text-white",
            },
          ].map(
            (item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {item.label}
                </div>

                <div
                  className={`mt-2 text-2xl font-black ${item.className}`}
                >
                  {item.value}
                </div>
              </div>
            )
          )}
        </section>

        {/* CHART */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">
                {
                  selectedMarket.symbol
                }{" "}
                Chart
              </h2>

              <p className="text-xs text-slate-500">
                {
                  TIMEFRAMES.find(
                    (item) =>
                      item.value ===
                      timeframe
                  )?.label
                }{" "}
                candles • Live simulated
                market
              </p>
            </div>

            <div className="rounded-lg bg-slate-950 px-3 py-2 text-xs text-emerald-400">
              ● MARKET LIVE
            </div>
          </div>

          <div
            ref={
              chartContainerRef
            }
            className="h-[430px] w-full"
          />
        </section>

        {/* ORDER PANEL */}
        <section className="mb-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-bold">
              Open New Position
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Virtual order execution only.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lot Size
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    lotSize
                  }
                  onChange={(
                    event
                  ) =>
                    setLotSize(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stop Loss
                </label>

                <input
                  type="number"
                  step="any"
                  value={
                    stopLoss
                  }
                  onChange={(
                    event
                  ) =>
                    setStopLoss(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Take Profit
                </label>

                <input
                  type="number"
                  step="any"
                  value={
                    takeProfit
                  }
                  onChange={(
                    event
                  ) =>
                    setTakeProfit(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  openTrade(
                    "BUY"
                  )
                }
                className="rounded-xl bg-emerald-500 px-5 py-4 font-black text-slate-950 transition hover:bg-emerald-400"
              >
                BUY @{" "}
                {formatPrice(
                  ask,
                  selectedMarket.category
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  openTrade(
                    "SELL"
                  )
                }
                className="rounded-xl bg-red-500 px-5 py-4 font-black text-white transition hover:bg-red-400"
              >
                SELL @{" "}
                {formatPrice(
                  bid,
                  selectedMarket.category
                )}
              </button>
            </div>

            {closeMessage && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                {
                  closeMessage
                }
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-bold">
              Account
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-950 p-4">
                <div className="text-xs text-slate-500">
                  Balance
                </div>

                <div className="mt-1 text-lg font-bold">
                  {formatMoney(
                    balance
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="text-xs text-slate-500">
                  Equity
                </div>

                <div
                  className={`mt-1 text-lg font-bold ${
                    equity >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatMoney(
                    equity
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="text-xs text-slate-500">
                  Used Margin
                </div>

                <div className="mt-1 text-lg font-bold">
                  {formatMoney(
                    usedMargin
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="text-xs text-slate-500">
                  Available Margin
                </div>

                <div className="mt-1 text-lg font-bold">
                  {formatMoney(
                    availableMargin
                  )}
                </div>
              </div>

              <div className="col-span-2 rounded-xl bg-slate-950 p-4">
                <div className="text-xs text-slate-500">
                  Unrealized P/L
                </div>

                <div
                  className={`mt-1 text-xl font-black ${
                    unrealizedPnl >=
                    0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {unrealizedPnl >=
                  0
                    ? "+"
                    : ""}
                  {formatMoney(
                    unrealizedPnl
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEPOSIT */}
        <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Virtual Deposit
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add simulated money to your demo
                account.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
              <input
                type="number"
                min="1"
                step="1"
                value={
                  depositAmount
                }
                onChange={(
                  event
                ) =>
                  setDepositAmount(
                    event.target
                      .value
                  )
                }
                placeholder="Amount"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={
                  makeDeposit
                }
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 font-bold text-emerald-400 hover:bg-emerald-500/20"
              >
                Add Virtual Funds
              </button>
            </div>
          </div>

          {depositMessage && (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
              {
                depositMessage
              }
            </div>
          )}
        </section>

        {/* POSITIONS / HISTORY */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "positions"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  activeTab ===
                  "positions"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Open Positions (
                {
                  positions.length
                }
                )
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "history"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  activeTab ===
                  "history"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                History (
                {
                  history.length
                }
                )
              </button>
            </div>

            {activeTab ===
              "positions" &&
              positions.length >
                0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={
                      closeWinningPositions
                    }
                    className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Close Winners
                  </button>

                  <button
                    type="button"
                    onClick={
                      closeAllPositions
                    }
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    Close All
                  </button>
                </div>
              )}
          </div>

          <div className="overflow-x-auto">
            {activeTab ===
            "positions" ? (
              positions.length ===
              0 ? (
                <div className="p-10 text-center">
                  <div className="text-lg font-bold">
                    No open positions
                  </div>

                  <div className="mt-2 text-sm text-slate-500">
                    Use the BUY or SELL buttons
                    above to open a simulated
                    position.
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">
                        Symbol
                      </th>

                      <th className="px-5 py-4">
                        Side
                      </th>

                      <th className="px-5 py-4">
                        Lots
                      </th>

                      <th className="px-5 py-4">
                        Entry
                      </th>

                      <th className="px-5 py-4">
                        Current
                      </th>

                      <th className="px-5 py-4">
                        SL
                      </th>

                      <th className="px-5 py-4">
                        TP
                      </th>

                      <th className="px-5 py-4">
                        P/L
                      </th>

                      <th className="px-5 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {positions.map(
                      (
                        position
                      ) => (
                        <tr
                          key={
                            position.id
                          }
                          className="border-b border-slate-800/70"
                        >
                          <td className="px-5 py-4 font-bold">
                            {
                              position.symbol
                            }
                          </td>

                          <td
                            className={`px-5 py-4 font-bold ${
                              position.side ===
                              "BUY"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {
                              position.side
                            }
                          </td>

                          <td className="px-5 py-4">
                            {
                              position.lotSize
                            }
                          </td>

                          <td className="px-5 py-4">
                            {formatPrice(
                              position.entryPrice,
                              position.category
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {formatPrice(
                              position.currentPrice,
                              position.category
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {position.stopLoss !==
                            null
                              ? formatPrice(
                                  position.stopLoss,
                                  position.category
                                )
                              : "—"}
                          </td>

                          <td className="px-5 py-4">
                            {position.takeProfit !==
                            null
                              ? formatPrice(
                                  position.takeProfit,
                                  position.category
                                )
                              : "—"}
                          </td>

                          <td
                            className={`px-5 py-4 font-bold ${
                              position.unrealizedPnl >=
                              0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {position.unrealizedPnl >=
                            0
                              ? "+"
                              : ""}
                            {formatMoney(
                              position.unrealizedPnl
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                closePosition(
                                  position.id
                                )
                              }
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-slate-500"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )
            ) : history.length ===
              0 ? (
              <div className="p-10 text-center">
                <div className="text-lg font-bold">
                  No trade history
                </div>

                <div className="mt-2 text-sm text-slate-500">
                  Closed simulated positions
                  will appear here.
                </div>
              </div>
            ) : (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Symbol
                    </th>

                    <th className="px-5 py-4">
                      Side
                    </th>

                    <th className="px-5 py-4">
                      Lots
                    </th>

                    <th className="px-5 py-4">
                      Entry
                    </th>

                    <th className="px-5 py-4">
                      Exit
                    </th>

                    <th className="px-5 py-4">
                      P/L
                    </th>

                    <th className="px-5 py-4">
                      Reason
                    </th>

                    <th className="px-5 py-4">
                      Closed
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map(
                    (trade) => (
                      <tr
                        key={`${trade.id}-${trade.closedAt}`}
                        className="border-b border-slate-800/70"
                      >
                        <td className="px-5 py-4 font-bold">
                          {
                            trade.symbol
                          }
                        </td>

                        <td
                          className={`px-5 py-4 font-bold ${
                            trade.side ===
                            "BUY"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {
                            trade.side
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            trade.lotSize
                          }
                        </td>

                        <td className="px-5 py-4">
                          {formatPrice(
                            trade.entryPrice,
                            trade.category
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {formatPrice(
                            trade.exitPrice,
                            trade.category
                          )}
                        </td>

                        <td
                          className={`px-5 py-4 font-bold ${
                            trade.profitLoss >=
                            0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {trade.profitLoss >=
                          0
                            ? "+"
                            : ""}
                          {formatMoney(
                            trade.profitLoss
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {
                            trade.closeReason ??
                            "Manual Close"
                          }
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {new Date(
                            trade.closedAt
                          ).toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-6 flex flex-col gap-2 border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          <p>
            MSA 26 Demo Account uses simulated
            markets and virtual money only.
          </p>

          <p>
            Account state is stored locally in
            this browser for demo persistence.
          </p>

          <p>
            Settings are applied to the simulated
            demo environment.
          </p>
        </footer>
      </div>
    </main>
  )
}