// src/features/intelligence/interview/interviewEngine.ts

import type { InterviewSession, CreativeIntent, QuestionId } from "./interviewTypes";
import { QUESTION_BANK, STARTING_QUESTION_ID } from "./questionBank";

export function startInterview(): InterviewSession {
  return {
    id: crypto.randomUUID(),
    state: "IN_PROGRESS",
    currentQuestionId: STARTING_QUESTION_ID,
    intent: {},
    history: [],
  };
}

function getNextValidQuestionId(
  currentId: QuestionId,
  intent: CreativeIntent
): QuestionId | null {
  const currentQuestion = QUESTION_BANK[currentId];
  if (!currentQuestion) return null;

  let nextIdTemplate = currentQuestion.nextId;
  let nextId = typeof nextIdTemplate === "function" 
    ? nextIdTemplate(intent) 
    : nextIdTemplate;

  while (nextId !== null) {
    const nextQuestion = QUESTION_BANK[nextId];
    if (!nextQuestion) return null;
    
    if (!nextQuestion.condition || nextQuestion.condition(intent)) {
      return nextId;
    }
    
    nextIdTemplate = nextQuestion.nextId;
    nextId = typeof nextIdTemplate === "function"
      ? nextIdTemplate(intent)
      : nextIdTemplate;
  }

  return null;
}

export function submitAnswer(
  session: InterviewSession,
  answer: string
): InterviewSession {
  if (session.state !== "IN_PROGRESS" || !session.currentQuestionId) {
    return session;
  }

  const currentId = session.currentQuestionId;
  
  const updatedIntent: CreativeIntent = {
    ...session.intent,
    [currentId]: answer,
  };

  const nextId = getNextValidQuestionId(currentId, updatedIntent);

  return {
    ...session,
    intent: updatedIntent,
    history: [...session.history, currentId],
    currentQuestionId: nextId,
    state: nextId === null ? "COMPLETED" : "IN_PROGRESS",
  };
}

export function goBack(session: InterviewSession): InterviewSession {
  if (session.history.length === 0) {
    return session;
  }

  const newHistory = [...session.history];
  const previousQuestionId = newHistory.pop() as QuestionId;

  return {
    ...session,
    state: "IN_PROGRESS",
    currentQuestionId: previousQuestionId,
    history: newHistory,
  };
}

export function cancelInterview(session: InterviewSession): InterviewSession {
  return {
    ...session,
    state: "CANCELLED",
  };
}

export function restartInterview(): InterviewSession {
  return startInterview();
}