// src/features/intelligence/interview/questionBank.ts

import type { InterviewQuestion, QuestionId } from "./interviewTypes";

// We store questions in a dictionary for O(1) lookup during state transitions
export const QUESTION_BANK: Record<QuestionId, InterviewQuestion> = {
  topic: {
    id: "topic",
    text: "What is the main topic of your video?",
    type: "free_text",
    nextId: "goal",
  },
  
  goal: {
    id: "goal",
    text: "What is the primary goal of this video?",
    type: "single_choice",
    options: [
      { label: "Educate / Teach", value: "educate" },
      { label: "Entertain", value: "entertain" },
      { label: "Sell a Product or Service", value: "sell" },
      { label: "Tell a Story", value: "storytelling" },
    ],
    nextId: "platform",
  },
  
  platform: {
    id: "platform",
    text: "Where are you publishing this?",
    type: "single_choice",
    options: [
      { label: "YouTube", value: "youtube" },
      { label: "TikTok", value: "tiktok" },
      { label: "Instagram Reels", value: "instagram" },
      { label: "Corporate / Internal", value: "corporate" },
      { label: "Online Course", value: "course" },
    ],
    // Dynamic Branching Example
    nextId: (intent) => {
      if (intent.platform === "tiktok" || intent.platform === "instagram") {
        // Skip duration for shorts, they are automatically short
        return "audience"; 
      }
      return "targetDuration";
    },
  },
  
  targetDuration: {
    id: "targetDuration",
    text: "Roughly how long should this video be?",
    type: "single_choice",
    options: [
      { label: "Under 60 seconds", value: "short" },
      { label: "2 - 5 minutes", value: "medium" },
      { label: "Over 10 minutes", value: "long" },
    ],
    // Skip Logic Example: Only ask if platform allows long-form
    condition: (intent) => 
      intent.platform === "youtube" || 
      intent.platform === "corporate" || 
      intent.platform === "course",
    nextId: "audience",
  },
  
  audience: {
    id: "audience",
    text: "Who is your target audience?",
    type: "single_choice",
    options: [
      { label: "Complete Beginners", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced / Experts", value: "advanced" },
      { label: "General Public", value: "general" },
    ],
    nextId: "tone",
  },
  
  tone: {
    id: "tone",
    text: "What is the vibe or tone of the edit?",
    type: "single_choice",
    options: [
      { label: "Professional & Corporate", value: "professional" },
      { label: "Friendly & Casual", value: "friendly" },
      { label: "High Energy & Fast-Paced", value: "energetic" },
      { label: "Dramatic & Cinematic", value: "cinematic" },
    ],
    // null signifies the end of the state machine
    nextId: null, 
  }
};

export const STARTING_QUESTION_ID: QuestionId = "topic";