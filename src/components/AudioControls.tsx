import React from 'react';
import { AppState } from '../types';
import { UI_COLORS } from '../config/constants';

interface AudioControlsProps {
    settings: AppState;
    disabled: boolean;
    onUpdate: (key: keyof AppState, value: number) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ settings, disabled, onUpdate }) => {
    const controls = [
        { label: 'ピッチシフト', key: 'pitchShift', min: -12, max: 12, step: 0.1, unit: '半音', format: (v: number) => v === 0 ? '0' : v.toFixed(1) },
        { label: 'リバーブ', key: 'reverbMix', min: 0, max: 1, step: 0.01, unit: '%', format: (v: number) => (v * 100).toFixed(0) },
        { label: '歪み', key: 'distortion', min: 0, max: 1, step: 0.01, unit: '%', format: (v: number) => (v * 100).toFixed(0) },
        { label: 'ノイズゲート', key: 'noiseGate', min: -100, max: -10, step: 1, unit: 'dB', format: (v: number) => v.toFixed(0) },
        { label: 'コンプレッサー', key: 'compressor', min: 0, max: 1, step: 0.01, unit: '%', format: (v: number) => (v * 100).toFixed(0) },
        { label: 'EQ 低音', key: 'eqLow', min: -20, max: 20, step: 1, unit: 'dB', format: (v: number) => (v > 0 ? '+' : '') + v.toFixed(0) },
        { label: 'EQ 中音', key: 'eqMid', min: -20, max: 20, step: 1, unit: 'dB', format: (v: number) => (v > 0 ? '+' : '') + v.toFixed(0) },
        { label: 'EQ 高音', key: 'eqHigh', min: -20, max: 20, step: 1, unit: 'dB', format: (v: number) => (v > 0 ? '+' : '') + v.toFixed(0) },
    ] as const;

    return (
        <div className="space-y-6">
            {controls.map((ctrl) => (
                <div key={ctrl.key}>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold" style={{ color: UI_COLORS.text }}>{ctrl.label}</label>
                        <span className="font-mono" style={{ color: UI_COLORS.primary }}>
                            {ctrl.format(settings[ctrl.key as keyof AppState] as number)}{ctrl.key !== 'pitchShift' ? ` ${ctrl.unit}` : ''}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={settings[ctrl.key as keyof AppState] as number}
                        onChange={(e) => onUpdate(ctrl.key as keyof AppState, parseFloat(e.target.value))}
                        className="slider"
                        disabled={disabled}
                    />
                </div>
            ))}
        </div>
    );
};
