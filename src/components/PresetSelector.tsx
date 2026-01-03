import React from 'react';
import { Sparkles } from 'lucide-react';
import { Preset } from '../types';
import { UI_COLORS } from '../config/constants';

interface PresetSelectorProps {
    presets: Preset[];
    selectedPreset: number;
    isLoading: boolean;
    onSelect: (index: number) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
    presets,
    selectedPreset,
    isLoading,
    onSelect,
}) => (
    <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} style={{ color: UI_COLORS.primary }} />
            <label className="font-semibold" style={{ color: UI_COLORS.text }}>
                プリセット
            </label>
        </div>
        {isLoading ? (
            <div className="text-center py-8" style={{ color: UI_COLORS.muted }}>
                プリセットを読み込み中...
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presets.map((preset, index) => (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(index)}
                        className={`px-4 py-3 rounded-lg border transition-all ${selectedPreset === index
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                            }`}
                        style={{
                            color: selectedPreset === index ? UI_COLORS.primary : UI_COLORS.text,
                        }}
                    >
                        <div className="font-semibold text-sm">{preset.name}</div>

                    </button>
                ))}
            </div>
        )}
    </div>
);
