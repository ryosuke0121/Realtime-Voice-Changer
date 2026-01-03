import { Preset } from '../types';

export const DEFAULT_PRESETS: Preset[] = [
    {
        id: 'original',
        name: 'デフォルト',
        pitch: 0,
        reverb: 0,
        distortion: 0,
        gain: 1.0,
        noiseGate: -50,
        compressor: 0,
        eq: { low: 0, mid: 0, high: 0 },
        description: '変更なし'
    },
    { id: 'male-to-female', name: '男声→女声', pitch: 5, reverb: 0.1, distortion: 0, gain: 0.9, description: '高めのピッチで女性的に' },
    { id: 'female-to-male', name: '女声→男声', pitch: -5, reverb: 0.1, distortion: 0, gain: 0.9, description: '低めのピッチで男性的に' },
    { id: 'robot', name: 'ロボット', pitch: 0, reverb: 0.3, distortion: 0.4, gain: 0.4, description: '機械的な音声' },
    { id: 'cave', name: '洞窟', pitch: -2, reverb: 0.8, distortion: 0, gain: 0.3, description: '広い空間の響き' },
    { id: 'monster', name: 'モンスター', pitch: -8, reverb: 0.5, distortion: 0.3, gain: 0.5, description: '低音で怪物のような声' },
];

export const AUDIO_CONFIG = {
    noiseGate: { threshold: -50, smoothing: 0.1 },
    compressor: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 },
    eq: { lowFrequency: 400, highFrequency: 2500 },
    pitchShift: { windowSize: 0.1, delayTime: 0, feedback: 0 },
    reverb: { decay: 2 },
};

export const UI_COLORS = {
    bg: '#0F172A',
    text: '#F8FAFC',
    primary: '#10B981',
    danger: '#EF4444',
    muted: '#94A3B8',
    surface: '#1E293B',
    border: '#334155',
};
