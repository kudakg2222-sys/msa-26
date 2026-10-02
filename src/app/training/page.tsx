"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import {
  trainingLevels,
  totalTrainingLessons,
  totalTrainingScenarios,
} from "@/data/trainingData"

import { getLessonContent } from "@/data/lessonContent"
import { getQuizzesForLevel } from "@/data/trainingQuizzes"
import { getTrainingScenarios } from "@/data/trainingScenarios"

import TrainingScenarioChart from "@/components/TrainingScenarioChart"

import {
  completeLesson,
  completeScenario,
  completeQuiz,
  getTrainingCompletion,
  loadTrainingProgress,
  resetTrainingProgress,
  type TrainingProgressState,
} from "@/lib/trainingProgress"

export default function TrainingPage() {
  const [progress, setProgress] =
    useState<TrainingProgressState | null>(null)

  const [selectedLevel, setSelectedLevel] = useState(1)
  const [selectedLesson, setSelectedLesson] =
    useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] =
    useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] =
    useState<string | null>(null)

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const [scenarioAnswer, setScenarioAnswer] =
    useState<string | null>(null)
  const [scenarioSubmitted, setScenarioSubmitted] =
    useState(false)

  useEffect(() => {
    setProgress(loadTrainingProgress())
  }, [])

  const currentLevel = useMemo(
    () =>
      trainingLevels.find(
        (level) => level.id === selectedLevel
      ) ?? trainingLevels[0],
    [selectedLevel]
  )

  const quizzes = useMemo(
    () => getQuizzesForLevel(selectedLevel),
    [selectedLevel]
  )

  const scenarios = useMemo(
    () => getTrainingScenarios(selectedLevel),
    [selectedLevel]
  )

  const selectedQuizData = quizzes.find(
    (quiz) => quiz.id === selectedQuiz
  )

  const selectedScenarioData = scenarios.find(
    (scenario) => scenario.id === selectedScenario
  )

  if (!progress) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-300">
          Loading training progress...
        </div>
      </main>
    )
  }

  const completion = getTrainingCompletion(progress)

  function handleLevelChange(levelId: number) {
    setSelectedLevel(levelId)

    setSelectedLesson(null)
    setSelectedQuiz(null)
    setSelectedScenario(null)

    setSelectedAnswer(null)
    setQuizSubmitted(false)

    setScenarioAnswer(null)
    setScenarioSubmitted(false)
  }

  function handleLessonComplete() {
    if (!progress || !selectedLesson) {
      return
    }

    const updated = completeLesson(
      progress,
      selectedLesson
    )

    setProgress(updated)
  }

  function handleQuizSubmit() {
    if (
      !progress ||
      !selectedQuizData ||
      selectedAnswer === null
    ) {
      return
    }

    const passed =
      selectedAnswer ===
      selectedQuizData.correctAnswer

    const updated = completeQuiz(
      progress,
      selectedQuizData.id,
      passed
    )

    setProgress(updated)
    setQuizSubmitted(true)
  }

  function handleScenarioSubmit() {
    if (
      !progress ||
      !selectedScenarioData ||
      !scenarioAnswer
    ) {
      return
    }

    const updated =
      scenarioAnswer ===
      selectedScenarioData.correctChoice
        ? completeScenario(
            progress,
            selectedScenarioData.id
          )
        : progress

    setProgress(updated)
    setScenarioSubmitted(true)
  }

  function handleReset() {
    resetTrainingProgress()
    setProgress(loadTrainingProgress())

    setSelectedLesson(null)
    setSelectedQuiz(null)
    setSelectedScenario(null)

    setSelectedAnswer(null)
    setQuizSubmitted(false)

    setScenarioAnswer(null)
    setScenarioSubmitted(false)
  }

  const levelLessonCompleted =
    currentLevel.lessons.filter(
      (lesson) =>
        progress.completedLessons.includes(
          `${currentLevel.id}:${lesson}`
        )
    ).length

  const levelScenarioCompleted =
    currentLevel.scenarios.filter(
      (scenario) =>
        progress.completedScenarios.includes(
          `${currentLevel.id}:${scenario}`
        )
    ).length

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to MSA 26
            </Link>

            <h1 className="mt-3 text-4xl font-bold">
              Training Mode
            </h1>

            <p className="mt-2 text-slate-400">
              Learn, practice and test your trading knowledge
              using simulated markets.
            </p>
          </div>

          <Link
            href="/demo"
            className="rounded-xl bg-emerald-500 px-5 py-3 text-center font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Open Demo Account
          </Link>
        </div>

        {/* Overall progress */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Overall Training Progress
              </p>

              <p className="mt-1 text-4xl font-bold">
                {completion}%
              </p>
            </div>

            <div className="w-full max-w-xl">
              <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${completion}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {progress.completedLessons.length}/
                {totalTrainingLessons} lessons •{" "}
                {progress.completedScenarios.length}/
                {totalTrainingScenarios} scenarios
              </p>
            </div>

            <button
              onClick={handleReset}
              className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Reset Progress
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Lessons"
            value={`${progress.completedLessons.length}/${totalTrainingLessons}`}
          />

          <StatCard
            title="Scenarios"
            value={`${progress.completedScenarios.length}/${totalTrainingScenarios}`}
          />

          <StatCard
            title="Quizzes Passed"
            value={progress.passedQuizzes.length.toString()}
          />

          <StatCard
            title="Simulated Trades"
            value={progress.simulatedTrades.toString()}
          />

          <StatCard
            title="Rule Violations"
            value={progress.ruleViolations.toString()}
          />

        </section>

        {/* Training roadmap */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold">
            Training Roadmap
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {trainingLevels.map((level) => {
              const active =
                level.id === selectedLevel

              const lessonsDone =
                level.lessons.filter(
                  (lesson) =>
                    progress.completedLessons.includes(
                      `${level.id}:${lesson}`
                    )
                ).length

              const scenariosDone =
                level.scenarios.filter(
                  (scenario) =>
                    progress.completedScenarios.includes(
                      `${level.id}:${scenario}`
                    )
                ).length

              return (
                <button
                  key={level.id}
                  onClick={() =>
                    handleLevelChange(level.id)
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Level {level.id}
                    </span>

                    {lessonsDone ===
                      level.lessons.length &&
                      scenariosDone ===
                        level.scenarios.length && (
                        <span className="text-emerald-400">
                          ✓
                        </span>
                      )}
                  </div>

                  <h3 className="mt-2 font-bold">
                    {level.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {level.description}
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    {lessonsDone}/
                    {level.lessons.length} lessons •{" "}
                    {scenariosDone}/
                    {level.scenarios.length} scenarios
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Current level */}
        <section className="mt-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div>
              <p className="text-sm text-emerald-400">
                LEVEL {currentLevel.id}
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {currentLevel.title}
              </h2>

              <p className="mt-2 text-slate-400">
                {currentLevel.description}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {levelLessonCompleted}/
                {currentLevel.lessons.length} lessons completed •{" "}
                {levelScenarioCompleted}/
                {currentLevel.scenarios.length} scenarios completed
              </p>
            </div>

            {/* Lessons */}
            <div className="mt-8">
              <h3 className="text-xl font-bold">
                Lessons
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {currentLevel.lessons.map(
                  (lesson) => {
                    const lessonId =
                      `${currentLevel.id}:${lesson}`

                    const completed =
                      progress.completedLessons.includes(
                        lessonId
                      )

                    const active =
                      selectedLesson === lessonId

                    return (
                      <button
                        key={lessonId}
                        onClick={() => {
                          setSelectedLesson(
                            active
                              ? null
                              : lessonId
                          )

                          setSelectedQuiz(null)
                          setSelectedScenario(null)
                        }}
                        className={`rounded-xl border p-4 text-left ${
                          active
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{lesson}</span>

                          <span
                            className={
                              completed
                                ? "text-emerald-400"
                                : "text-slate-600"
                            }
                          >
                            {completed ? "✓" : "○"}
                          </span>
                        </div>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Lesson viewer */}
            {selectedLesson && (
              <div className="mt-6 rounded-2xl border border-blue-500/30 bg-slate-950 p-6">
                {(() => {
                  const lessonName =
                    selectedLesson
                      .split(":")
                      .slice(1)
                      .join(":")

                  const content =
                    getLessonContent(
                      currentLevel.id,
                      lessonName
                    )

                  const completed =
                    progress.completedLessons.includes(
                      selectedLesson
                    )

                  return (
                    <>
                      <p className="text-sm text-blue-400">
                        LESSON
                      </p>

                      <h3 className="mt-1 text-2xl font-bold">
                        {content.title}
                      </h3>

                      <p className="mt-4 text-slate-300">
                        {content.explanation}
                      </p>

                      <div className="mt-6">
                        <h4 className="font-semibold">
                          Key points
                        </h4>

                        <ul className="mt-3 space-y-2">
                          {content.keyPoints.map(
                            (point) => (
                              <li
                                key={point}
                                className="rounded-lg bg-slate-900 p-3 text-sm text-slate-300"
                              >
                                • {point}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {!completed && (
                        <button
                          onClick={
                            handleLessonComplete
                          }
                          className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                          Mark Lesson Complete
                        </button>
                      )}

                      {completed && (
                        <div className="mt-6 rounded-xl bg-emerald-500/10 p-4 text-emerald-400">
                          ✓ Lesson completed
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* Quizzes */}
            <div className="mt-10">
              <h3 className="text-xl font-bold">
                Knowledge Checks
              </h3>

              {quizzes.length === 0 ? (
                <p className="mt-3 text-slate-500">
                  More quizzes will be added to this
                  level.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {quizzes.map((quiz) => {
                    const completed =
                      progress.completedQuizzes.includes(
                        quiz.id
                      )

                    const passed =
                      progress.passedQuizzes.includes(
                        quiz.id
                      )

                    return (
                      <button
                        key={quiz.id}
                        onClick={() => {
                          setSelectedQuiz(quiz.id)
                          setSelectedLesson(null)
                          setSelectedScenario(null)

                          setSelectedAnswer(null)
                          setQuizSubmitted(false)
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-slate-700"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">
                            {quiz.question}
                          </span>

                          <span className="text-sm">
                            {passed
                              ? "✓"
                              : completed
                                ? "Done"
                                : "Start"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quiz viewer */}
            {selectedQuizData && (
              <div className="mt-6 rounded-2xl border border-purple-500/30 bg-slate-950 p-6">

                <p className="text-sm text-purple-400">
                  KNOWLEDGE CHECK
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {selectedQuizData.question}
                </h3>

                <div className="mt-5 space-y-3">
                  {selectedQuizData.options.map(
                    (option, index) => {
                      const selected =
                        selectedAnswer === index

                      const correct =
                        quizSubmitted &&
                        index ===
                          selectedQuizData.correctAnswer

                      const wrong =
                        quizSubmitted &&
                        selected &&
                        index !==
                          selectedQuizData.correctAnswer

                      return (
                        <button
                          key={option}
                          disabled={quizSubmitted}
                          onClick={() =>
                            setSelectedAnswer(index)
                          }
                          className={`w-full rounded-xl border p-4 text-left ${
                            correct
                              ? "border-emerald-500 bg-emerald-500/10"
                              : wrong
                                ? "border-red-500 bg-red-500/10"
                                : selected
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    }
                  )}
                </div>

                {!quizSubmitted && (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={
                      selectedAnswer === null
                    }
                    className="mt-5 rounded-xl bg-purple-500 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Submit Answer
                  </button>
                )}

                {quizSubmitted && (
                  <div className="mt-5 rounded-xl bg-slate-900 p-5">
                    {selectedAnswer ===
                    selectedQuizData.correctAnswer ? (
                      <p className="font-semibold text-emerald-400">
                        ✓ Correct
                      </p>
                    ) : (
                      <p className="font-semibold text-red-400">
                        ✗ Not quite
                      </p>
                    )}

                    <p className="mt-3 text-sm text-slate-300">
                      {selectedQuizData.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Scenarios */}
            <div className="mt-10">
              <h3 className="text-xl font-bold">
                Trading Scenarios
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Make a decision based only on the
                information currently provided. Future
                simulated market movement is hidden.
              </p>

              {scenarios.length === 0 ? (
                <p className="mt-4 text-slate-500">
                  More scenarios will be added to this
                  level.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {scenarios.map((scenario) => {
                    const completed =
                      progress.completedScenarios.includes(
                        scenario.id
                      )

                    const active =
                      selectedScenario ===
                      scenario.id

                    return (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenario(
                            active
                              ? null
                              : scenario.id
                          )

                          setSelectedLesson(null)
                          setSelectedQuiz(null)

                          setScenarioAnswer(null)
                          setScenarioSubmitted(false)
                        }}
                        className={`rounded-xl border p-4 text-left ${
                          active
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {scenario.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {scenario.market}
                            </p>
                          </div>

                          <span
                            className={
                              completed
                                ? "text-emerald-400"
                                : "text-slate-600"
                            }
                          >
                            {completed ? "✓" : "○"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Scenario viewer */}
            {selectedScenarioData && (
              <div className="mt-6 rounded-2xl border border-orange-500/30 bg-slate-950 p-6">

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-orange-400">
                      SIMULATED SCENARIO
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      {selectedScenarioData.title}
                    </h3>
                  </div>

                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-400">
                    {selectedScenarioData.market}
                  </div>
                </div>

                {/* Scenario Chart */}
                <TrainingScenarioChart
                  scenarioId={selectedScenarioData.id}
                />

                <div className="mt-6 rounded-xl bg-slate-900 p-5">
                  <p className="text-slate-300">
                    {selectedScenarioData.description}
                  </p>

                  <p className="mt-4 font-semibold text-white">
                    Objective
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedScenarioData.objective}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedScenarioData.choices.map(
                    (choice) => {
                      const selected =
                        scenarioAnswer === choice.id

                      const correct =
                        scenarioSubmitted &&
                        choice.id ===
                          selectedScenarioData.correctChoice

                      const wrong =
                        scenarioSubmitted &&
                        selected &&
                        choice.id !==
                          selectedScenarioData.correctChoice

                      return (
                        <button
                          key={choice.id}
                          disabled={
                            scenarioSubmitted
                          }
                          onClick={() =>
                            setScenarioAnswer(
                              choice.id
                            )
                          }
                          className={`w-full rounded-xl border p-4 text-left ${
                            correct
                              ? "border-emerald-500 bg-emerald-500/10"
                              : wrong
                                ? "border-red-500 bg-red-500/10"
                                : selected
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
                          }`}
                        >
                          <p className="font-semibold">
                            {choice.label}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {choice.description}
                          </p>
                        </button>
                      )
                    }
                  )}
                </div>

                {!scenarioSubmitted && (
                  <button
                    onClick={
                      handleScenarioSubmit
                    }
                    disabled={!scenarioAnswer}
                    className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Submit Decision
                  </button>
                )}

                {scenarioSubmitted && (
                  <div className="mt-5 rounded-xl bg-slate-900 p-5">

                    {scenarioAnswer ===
                    selectedScenarioData.correctChoice ? (
                      <p className="font-semibold text-emerald-400">
                        ✓ Correct decision
                      </p>
                    ) : (
                      <p className="font-semibold text-red-400">
                        ✗ Review the scenario
                      </p>
                    )}

                    <p className="mt-3 text-sm text-slate-300">
                      {selectedScenarioData.explanation}
                    </p>

                    {scenarioAnswer !==
                      selectedScenarioData.correctChoice && (
                      <p className="mt-3 text-xs text-slate-500">
                        The scenario is not asking you to
                        predict an unseen future candle. It
                        tests whether your decision matches
                        the information and rules provided.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

        {/* Training philosophy */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            MSA 26 Training Principle
          </h2>

          <p className="mt-3 text-slate-400">
            The simulator knows the future, but the player
            does not. Training scenarios reveal only the
            information available at the simulated decision
            point.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            All markets, balances and trading activity in
            MSA 26 are simulated for education and practice.
          </p>
        </section>

      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}