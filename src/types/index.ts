export type Preset = {
    id: string;
    name: string;
    pitch: number;
    reverb: number;
    distortion: number;
    gain?: number;
    noiseGate?: number;
    compressor?: number;
    eq?: { low: number; mid: number; high: number };
    description: string;
};

export type AppState = {
    isRecording: boolean;
    isPlaying: boolean;
    pitchShift: number;
    reverbMix: number;
    distortion: number;
    gain: number;
    noiseGate: number;
    compressor: number;
    eqLow: number;
    eqMid: number;
    eqHigh: number;
};
