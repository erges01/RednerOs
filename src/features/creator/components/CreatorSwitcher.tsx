// src/features/creator/components/CreatorSwitcher.tsx

import { useCreatorStore } from "../store/creatorStore";

export function CreatorSwitcher() {
  const { creator, personas, switchPersona } = useCreatorStore();
  const activePersona = personas.find(p => p.id === creator?.activePersonaId);

  if (!creator) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] rounded border border-[#3e3e3e]">
      <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold">
        {activePersona?.name.charAt(0)}
      </div>
      <select 
        value={creator.activePersonaId || ""}
        onChange={(e) => switchPersona(e.target.value)}
        className="bg-transparent text-[12px] text-[#cccccc] focus:outline-none cursor-pointer"
      >
        {personas.map(p => (
          <option key={p.id} value={p.id} className="bg-[#252526]">
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}