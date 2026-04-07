import { describe, expect, it } from 'vitest';
import { getSupportedRecordingMimeType } from '../utils/recording';

describe('getSupportedRecordingMimeType', () => {
    it('prefers webm opus when available', () => {
        const mimeType = getSupportedRecordingMimeType((candidate) =>
            candidate === 'audio/webm;codecs=opus' || candidate === 'audio/webm'
        );

        expect(mimeType).toBe('audio/webm;codecs=opus');
    });

    it('falls back to empty string when no candidates are supported', () => {
        const mimeType = getSupportedRecordingMimeType(() => false);

        expect(mimeType).toBe('');
    });
});
