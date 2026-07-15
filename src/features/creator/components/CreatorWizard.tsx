// src/features/creator/components/CreatorWizard.tsx
import { useState } from "react";
import { initializeCreator } from "../services/creatorService";
import { Terminal, User, Mail } from "lucide-react";

export function CreatorWizard({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleCreate = () => {
    if (!name || !email) return;
    initializeCreator(name, email);
    onComplete();
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#1e1e1e]">
      <div className="w-[500px] bg-[#252526] border border-[#3c3c3c] rounded shadow-2xl p-8">
        <h1 className="text-[20px] font-medium text-white flex items-center gap-3 mb-8">
          <Terminal size={20} className="text-[#007acc]" />
          Initialize Creator Profile
        </h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] text-[#858585] uppercase tracking-wider font-semibold">Display Name</label>
            <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#3c3c3c] px-3 py-2 rounded focus-within:border-[#007acc]">
              <User size={14} className="text-[#858585]" />
              <input 
                className="flex-1 bg-transparent text-[13px] text-white focus:outline-none"
                placeholder="e.g. Adesope"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] text-[#858585] uppercase tracking-wider font-semibold">Email Address</label>
            <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#3c3c3c] px-3 py-2 rounded focus-within:border-[#007acc]">
              <Mail size={14} className="text-[#858585]" />
              <input 
                className="flex-1 bg-transparent text-[13px] text-white focus:outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleCreate}
            className="w-full mt-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white font-medium rounded text-[13px] transition-colors"
          >
            Bootstrap Identity
          </button>
        </div>
      </div>
      <p className="mt-6 text-[12px] text-[#858585]">RednerOS v1.0.0-alpha</p>
    </div>
  );
}