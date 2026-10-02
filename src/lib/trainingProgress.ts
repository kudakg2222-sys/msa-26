import {
  totalTrainingLessons,
  totalTrainingScenarios,
} from "@/data/trainingData"

export type TrainingProgressState = {
  completedLessons: string[]
  completedScenarios: string[]
  completedQuizzes: string[]
  passedQuizzes: string[]
  simulatedTrades: number
  ruleViolations: number
  journalEntries: number
  assessmentsCompleted: number
}

const STORAGE_KEY = "msa26-training-progress"

export const defaultTrainingProgress: TrainingProgressState = {
  completedLessons: [],
  completedScenarios: [],
  completedQuizzes: [],
  passedQuizzes: [],
  simulatedTrades: 0,
  ruleViolations: 0,
  journalEntries: 0,
  assessmentsCompleted: 0,
}

export function loadTrainingProgress(): TrainingProgressState {
  if (typeof window === "undefined") {
    return defaultTrainingProgress
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return defaultTrainingProgress
    }

    const parsed = JSON.parse(saved)

    return {
      ...defaultTrainingProgress,
      ...parsed,
    }
  } catch {
    return defaultTrainingProgress
  }
}

export function saveTrainingProgress(
  progress: TrainingProgressState
) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(progress)
  )
}

export function completeLesson(
  progress: TrainingProgressState,
  lessonId: string
): TrainingProgressState {
  if (progress.completedLessons.includes(lessonId)) {
    return progress
  }

  const updated = {
    ...progress,
    completedLessons: [
      ...progress.completedLessons,
      lessonId,
    ],
  }

  saveTrainingProgress(updated)

  return updated
}

export function completeScenario(
  progress: TrainingProgressState,
  scenarioId: string
): TrainingProgressState {
  if (progress.completedScenarios.includes(scenarioId)) {
    return progress
  }

  const updated = {
    ...progress,
    completedScenarios: [
      ...progress.completedScenarios,
      scenarioId,
    ],
  }

  saveTrainingProgress(updated)

  return updated
}

export function completeQuiz(
  progress: TrainingProgressState,
  quizId: string,
  passed: boolean
): TrainingProgressState {
  const completedQuizzes = progress.completedQuizzes.includes(
    quizId
  )
    ? progress.completedQuizzes
    : [...progress.completedQuizzes, quizId]

  const passedQuizzes =
    passed && !progress.passedQuizzes.includes(quizId)
      ? [...progress.passedQuizzes, quizId]
      : progress.passedQuizzes

  const updated = {
    ...progress,
    completedQuizzes,
    passedQuizzes,
  }

  saveTrainingProgress(updated)

  return updated
}

export function recordSimulatedTrade(
  progress: TrainingProgressState
): TrainingProgressState {
  const updated = {
    ...progress,
    simulatedTrades: progress.simulatedTrades + 1,
  }

  saveTrainingProgress(updated)

  return updated
}

export function recordRuleViolation(
  progress: TrainingProgressState
): TrainingProgressState {
  const updated = {
    ...progress,
    ruleViolations: progress.ruleViolations + 1,
  }

  saveTrainingProgress(updated)

  return updated
}

export function recordJournalEntry(
  progress: TrainingProgressState
): TrainingProgressState {
  const updated = {
    ...progress,
    journalEntries: progress.journalEntries + 1,
  }

  saveTrainingProgress(updated)

  return updated
}

export function recordAssessment(
  progress: TrainingProgressState
): TrainingProgressState {
  const updated = {
    ...progress,
    assessmentsCompleted:
      progress.assessmentsCompleted + 1,
  }

  saveTrainingProgress(updated)

  return updated
}

export function getTrainingCompletion(
  progress: TrainingProgressState
) {
  const lessonProgress =
    totalTrainingLessons === 0
      ? 0
      : progress.completedLessons.length /
        totalTrainingLessons

  const scenarioProgress =
    totalTrainingScenarios === 0
      ? 0
      : progress.completedScenarios.length /
        totalTrainingScenarios

  return Math.round(
    ((lessonProgress + scenarioProgress) / 2) * 100
  )
}

export function resetTrainingProgress() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(STORAGE_KEY)
}