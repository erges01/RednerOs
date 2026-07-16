import { usePerformanceStore } from '../store/performanceStore';
import { useEditorStore } from '../../workspace/store/editorStore'; 
import { v4 as uuidv4 } from 'uuid';
import type { EnergyLevel, ExpressionPreset, GestureStyle, CameraFraming } from '../types/performance';
import type { Track } from '../../workspace/types/editor';

export function PerformanceDashboard() {
  const { profiles, activeProfileId, setActiveProfile, updateProfile } = usePerformanceStore();
  const { timeline, addPreconstructedClip } = useEditorStore();
  
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  if (!activeProfile) return null;

  const handleUpdate = (updates: Partial<typeof activeProfile>) => {
    updateProfile(activeProfile.id, updates);
  };

  const handleCommitToTimeline = () => {
    if (!timeline) return;

    // Fixed implicit 'any' type by explicitly typing 't' as Track
    const perfTrack = timeline.tracks.find((t: Track) => t.type === 'performance');
    if (!perfTrack) {
        alert("Director Track not found in timeline!");
        return;
    }

    const newClip = {
      id: uuidv4(),
      track_id: perfTrack.id,
      type: "performance_instruction" as const,
      start_ms: timeline.playhead_ms,
      duration_ms: 3000, 
      label: `🎬 ${activeProfile.name}`,
      metadata: {
        directiveType: "behavior",
        value: activeProfile.name,
        settings: {
           energy: activeProfile.energy,
           expression: activeProfile.defaultExpression,
           eyeContact: activeProfile.eyeContactLevel,
           gesture: activeProfile.gestureStyle,
           camera: activeProfile.preferredCamera,
           pace: activeProfile.speakingStyle.pace
        }
      }
    };

    addPreconstructedClip(perfTrack.id, newClip);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] rounded-md border border-[#2b2b2b] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-lg font-bold text-white">🎭 Performance Engine</h2>
          <p className="text-xs text-[#858585]">Direct your digital human's on-camera behavior.</p>
        </div>
        <select
          value={activeProfileId || ''}
          onChange={(e) => setActiveProfile(e.target.value)}
          className="bg-[#252526] border border-[#3c3c3c] rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-[#007acc]"
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 gap-8 p-6 flex-1 overflow-y-auto">
        {/* Left Column: Presence */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2b2b2b] pb-2">Presence & Expression</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#858585]">Energy Level</label>
            <select value={activeProfile.energy} onChange={(e) => handleUpdate({ energy: e.target.value as EnergyLevel })} className="bg-[#252526] border border-[#3c3c3c] rounded px-3 py-2 text-sm">
              <option value="low">Low (Calm & Focused)</option>
              <option value="medium">Medium (Conversational)</option>
              <option value="high">High (Energetic & Loud)</option>
              <option value="dynamic">Dynamic (Adapts to Script)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#858585]">Default Expression</label>
            <select value={activeProfile.defaultExpression} onChange={(e) => handleUpdate({ defaultExpression: e.target.value as ExpressionPreset })} className="bg-[#252526] border border-[#3c3c3c] rounded px-3 py-2 text-sm">
              <option value="neutral">😐 Neutral</option>
              <option value="happy">😊 Happy</option>
              <option value="confident">😎 Confident</option>
              <option value="serious">🧐 Serious</option>
              <option value="curious">🤔 Curious</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between"><label className="text-xs text-[#858585]">Eye Contact</label><span className="text-xs font-mono text-[#4ec9b0]">{activeProfile.eyeContactLevel}%</span></div>
            <input type="range" min="0" max="100" value={activeProfile.eyeContactLevel} onChange={(e) => handleUpdate({ eyeContactLevel: parseInt(e.target.value) })} className="w-full accent-[#007acc]" />
          </div>
        </div>

        {/* Right Column: Movement */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2b2b2b] pb-2">Movement & Camera</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#858585]">Gesture Style</label>
            <select value={activeProfile.gestureStyle} onChange={(e) => handleUpdate({ gestureStyle: e.target.value as GestureStyle })} className="bg-[#252526] border border-[#3c3c3c] rounded px-3 py-2 text-sm">
              <option value="minimal">Minimal Speaker</option>
              <option value="teacher">Teacher / Explainer</option>
              <option value="podcast">Podcast Host</option>
              <option value="energetic">High-Energy Creator</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#858585]">Preferred Framing</label>
            <select value={activeProfile.preferredCamera} onChange={(e) => handleUpdate({ preferredCamera: e.target.value as CameraFraming })} className="bg-[#252526] border border-[#3c3c3c] rounded px-3 py-2 text-sm">
              <option value="close-up">Close Up</option>
              <option value="medium">Medium Shot (Waist Up)</option>
              <option value="wide">Wide Shot</option>
              <option value="dynamic-push">Dynamic Push-In</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between"><label className="text-xs text-[#858585]">Speaking Pace</label><span className="text-xs font-mono text-[#4ec9b0]">{activeProfile.speakingStyle.pace}x</span></div>
            <input type="range" min="0.5" max="2.0" step="0.1" value={activeProfile.speakingStyle.pace} onChange={(e) => handleUpdate({ speakingStyle: { ...activeProfile.speakingStyle, pace: parseFloat(e.target.value) } })} className="w-full accent-[#007acc]" />
          </div>
        </div>
      </div>

      {/* Footer Commit Button */}
      <div className="p-6 border-t border-[#2b2b2b]">
        <button 
          onClick={handleCommitToTimeline}
          className="w-full bg-[#007acc] hover:bg-[#005a96] text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          <span>Commit to Timeline</span>
        </button>
      </div>
    </div>
  );
}