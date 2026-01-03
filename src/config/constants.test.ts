import { describe, it, expect } from 'vitest';
import { DEFAULT_PRESETS, AUDIO_CONFIG } from '../config/constants';

describe('Constants', () => {
    it('should have default presets', () => {
        expect(DEFAULT_PRESETS.length).toBeGreaterThan(0);
        expect(DEFAULT_PRESETS[0].id).toBe('original');
    });

    it('should have valid audio config', () => {
        expect(AUDIO_CONFIG.noiseGate.threshold).toBe(-50);
        expect(AUDIO_CONFIG.compressor.ratio).toBe(4);
    });
});
