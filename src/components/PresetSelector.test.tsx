import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresetSelector } from './PresetSelector';
import { DEFAULT_PRESETS } from '../config/constants';

describe('PresetSelector', () => {
    it('renders loading state', () => {
        render(
            <PresetSelector
                presets={[]}
                selectedPreset={0}
                isLoading={true}
                onSelect={() => { }}
            />
        );
        expect(screen.getByText('プリセットを読み込み中...')).toBeInTheDocument();
    });

    it('renders presets and handles click', () => {
        const onSelect = vi.fn();
        render(
            <PresetSelector
                presets={DEFAULT_PRESETS}
                selectedPreset={0}
                isLoading={false}
                onSelect={onSelect}
            />
        );

        const firstPreset = screen.getByText(DEFAULT_PRESETS[0].name);
        expect(firstPreset).toBeInTheDocument();

        fireEvent.click(firstPreset);
        expect(onSelect).toHaveBeenCalledWith(0);
    });
});
