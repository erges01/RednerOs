// src/features/creator/services/creatorService.ts

import { v4 as uuidv4 } from "uuid";
import { useCreatorStore } from "../store/creatorStore";
import type { Persona } from "../types/creator";

export const initializeCreator = (name: string, email: string) => {
  const creatorId = uuidv4();
  const initialPersonaId = uuidv4();

  const newCreator = {
    id: creatorId,
    displayName: name,
    email,
    createdAt: Date.now(),
    activePersonaId: initialPersonaId,
    personaIds: [initialPersonaId],
  };

  const defaultPersona: Persona = {
    id: initialPersonaId,
    creatorId,
    name: "Default Persona",
    description: "My first creative persona.",
    systemPrompt: "You are an AI assistant helping a creative professional.",
    tone: "professional",
  };

  const { setCreator, addPersona } = useCreatorStore.getState();
  
  setCreator(newCreator);
  addPersona(defaultPersona);
};