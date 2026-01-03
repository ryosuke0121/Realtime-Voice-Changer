import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PresetSelector } from './components/PresetSelector';
import { AudioControls } from './components/AudioControls';
import { Recorder } from './components/Recorder';
import { useAudioProcessor } from './services/useAudioProcessor';
import { DEFAULT_PRESETS, UI_COLORS } from './config/constants';
import { AppState, Preset } from './types';

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [isLoadingPresets, setIsLoadingPresets] = useState(true);

    const [settings, setSettings] = useState<AppState>({
        isRecording: false,
        isPlaying: false,
        pitchShift: 0,
        reverbMix: 0,
        distortion: 0,
        noiseGate: -50,
        compressor: 0,
        eqLow: 0,
        eqMid: 0,
        eqHigh: 0,
    });

    const { start, stop, destinationRef, error } = useAudioProcessor(settings);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const res = await fetch('/api/presets');
                if (!res.ok) throw new Error();
                const data = await res.json();
                setPresets(data.presets || DEFAULT_PRESETS);
            } catch {
                setPresets(DEFAULT_PRESETS);
            } finally {
                setIsLoadingPresets(false);
            }
        };
        fetchPresets();
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('voiceChangerSettings');
        if (saved) {
            try {
                setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
            } catch { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('voiceChangerSettings', JSON.stringify(settings));
    }, [settings]);

    const handlePresetSelect = (index: number) => {
        setSelectedPreset(index);
        const p = presets[index];
        setSettings(prev => ({
            ...prev,
            pitchShift: p.pitch,
            reverbMix: p.reverb,
            distortion: p.distortion,
            noiseGate: p.noiseGate ?? prev.noiseGate,
            compressor: p.compressor ?? prev.compressor,
            eqLow: p.eq?.low ?? prev.eqLow,
            eqMid: p.eq?.mid ?? prev.eqMid,
            eqHigh: p.eq?.high ?? prev.eqHigh,
        }));
    };

    const updateSetting = (key: keyof AppState, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSelectedPreset(-1);
    };

    const toggleRecording = async () => {
        if (isRecording) {
            stop();
            setIsRecording(false);
        } else {
            try {
                await start();
                setIsRecording(true);
            } catch (e) {
                alert('マイクへのアクセス許可が必要です');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: UI_COLORS.bg }}>
            <div className="w-full max-w-2xl">
                <Header />

                <div className="control-panel mb-8">
                    <Recorder
                        isRecording={isRecording}
                        destinationNode={destinationRef}
                        onStartRecording={toggleRecording}
                        onStopRecording={toggleRecording}
                    />

                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    <PresetSelector
                        presets={presets}
                        selectedPreset={selectedPreset}
                        isLoading={isLoadingPresets}
                        onSelect={handlePresetSelect}
                    />

                    <AudioControls
                        settings={settings}
                        disabled={false}
                        onUpdate={updateSetting}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
