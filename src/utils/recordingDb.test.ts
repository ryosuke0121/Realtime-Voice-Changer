import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getActiveSessionId,
    setActiveSessionId,
    clearActiveSessionId,
} from '../utils/recordingDb';

// The IndexedDB operations (saveChunk, loadChunks, clearChunks) rely on a real
// IndexedDB implementation which jsdom does not provide.  We test the
// localStorage-backed session helpers here, and verify the IndexedDB helpers
// are exported functions.

describe('recordingDb – session helpers', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns null when no active session is set', () => {
        expect(getActiveSessionId()).toBeNull();
    });

    it('stores and retrieves an active session id', () => {
        setActiveSessionId('session-12345');
        expect(getActiveSessionId()).toBe('session-12345');
    });

    it('clears the active session id', () => {
        setActiveSessionId('session-12345');
        clearActiveSessionId();
        expect(getActiveSessionId()).toBeNull();
    });

    it('overwrites a previous session id', () => {
        setActiveSessionId('session-aaa');
        setActiveSessionId('session-bbb');
        expect(getActiveSessionId()).toBe('session-bbb');
    });
});

describe('recordingDb – IndexedDB helpers are exported', () => {
    it('saveChunk is a function', async () => {
        const { saveChunk } = await import('../utils/recordingDb');
        expect(typeof saveChunk).toBe('function');
    });

    it('loadChunks is a function', async () => {
        const { loadChunks } = await import('../utils/recordingDb');
        expect(typeof loadChunks).toBe('function');
    });

    it('clearChunks is a function', async () => {
        const { clearChunks } = await import('../utils/recordingDb');
        expect(typeof clearChunks).toBe('function');
    });
});

describe('preset localStorage cache', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('saves presets to localStorage after a successful fetch', async () => {
        const mockPresets = [{ id: 'test', name: 'Test', pitch: 0, reverb: 0, distortion: 0, description: '' }];
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ presets: mockPresets }),
        }));

        // Simulate the App.tsx fetch logic inline
        const PRESET_CACHE_KEY = 'cachedPresets';
        try {
            const res = await fetch('/api/presets');
            if (!res.ok) throw new Error();
            const data = await res.json() as { presets: unknown[] };
            localStorage.setItem(PRESET_CACHE_KEY, JSON.stringify(data.presets));
        } catch { }

        const cached = localStorage.getItem(PRESET_CACHE_KEY);
        expect(cached).not.toBeNull();
        expect(JSON.parse(cached!)).toEqual(mockPresets);
    });

    it('falls back to cached presets when fetch fails', async () => {
        const cachedPresets = [{ id: 'cached', name: 'Cached', pitch: 0, reverb: 0, distortion: 0, description: '' }];
        const PRESET_CACHE_KEY = 'cachedPresets';
        localStorage.setItem(PRESET_CACHE_KEY, JSON.stringify(cachedPresets));

        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

        let result: unknown[] = [];
        try {
            const res = await fetch('/api/presets');
            if (!res.ok) throw new Error();
            const data = await res.json() as { presets: unknown[] };
            result = data.presets;
        } catch {
            const cached = localStorage.getItem(PRESET_CACHE_KEY);
            if (cached) result = JSON.parse(cached) as unknown[];
        }

        expect(result).toEqual(cachedPresets);
    });
});
