// src/features/intelligence/interview/memoryTypes.ts

import type { Platform, VideoLength, ExpertiseLevel } from "./interviewTypes";

export interface CreatorMemory {
  preferredPlatform?: Platform;
  preferredLength?: VideoLength;
  preferredAudience?: ExpertiseLevel;
  preferredTone?: string;
}