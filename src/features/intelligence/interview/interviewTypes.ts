// src/features/intelligence/interview/interviewTypes.ts

export type InterviewState = "IDLE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Platform = "youtube" | "tiktok" | "instagram" | "corporate" | "course" | "other";
export type VideoLength = "short" | "medium" | "long";
export type ExpertiseLevel = "beginner" | "intermediate" | "advanced" | "general";

// The final output of the interview. This is what the Planner will consume.
export interface CreativeIntent {
  topic?: string;
  goal?: string;
  platform?: Platform;
  targetDuration?: VideoLength;
  audience?: ExpertiseLevel;
  tone?: string;
}

export type QuestionId = keyof CreativeIntent;

export interface QuestionOption {
  label: string;
  value: string;
}

// The core node of the question graph
export interface InterviewQuestion {
  id: QuestionId;
  text: string;
  type: "single_choice" | "free_text";
  options?: QuestionOption[];
  
  // Skip logic: If this returns false, the engine skips this question
  condition?: (currentIntent: CreativeIntent) => boolean; 
  
  // Dynamic branching: What question comes next based on current answers?
  // If null, the interview is complete.
  nextId: QuestionId | null | ((currentIntent: CreativeIntent) => QuestionId | null);
}

// The active memory of the current interview session
export interface InterviewSession {
  id: string;
  state: InterviewState;
  currentQuestionId: QuestionId | null;
  intent: CreativeIntent;
  history: QuestionId[]; // Enables a "Go Back" button
}