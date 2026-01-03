import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { AUDIO_CONFIG } from '../config/constants';
import { AppState } from '../types';

export const useAudioProcessor = (settings: AppState) => {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const micRef = useRef<Tone.UserMedia | null>(null);
    const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const distortionRef = useRef<Tone.Distortion | null>(null);
    const noiseGateRef = useRef<Tone.Gate | null>(null);
    const compressorRef = useRef<Tone.Compressor | null>(null);
    const eq3Ref = useRef<Tone.EQ3 | null>(null);
    const gainRef = useRef<Tone.Gain | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    useEffect(() => {
        const setupAudio = async () => {
            try {
                micRef.current = new Tone.UserMedia();

                noiseGateRef.current = new Tone.Gate(AUDIO_CONFIG.noiseGate);
                compressorRef.current = new Tone.Compressor(AUDIO_CONFIG.compressor);
                eq3Ref.current = new Tone.EQ3({ ...AUDIO_CONFIG.eq, low: 0, mid: 0, high: 0 });
                pitchShiftRef.current = new Tone.PitchShift(AUDIO_CONFIG.pitchShift);
                reverbRef.current = new Tone.Reverb(AUDIO_CONFIG.reverb);
                await reverbRef.current.generate();

                distortionRef.current = new Tone.Distortion({ distortion: 0, wet: 1 });
                gainRef.current = new Tone.Gain(1.0);

                const ctx = Tone.context.rawContext as AudioContext;
                destinationRef.current = ctx.createMediaStreamDestination();

                if (
                    micRef.current && noiseGateRef.current && compressorRef.current &&
                    eq3Ref.current && pitchShiftRef.current && reverbRef.current &&
                    distortionRef.current && gainRef.current
                ) {
                    micRef.current.chain(
                        noiseGateRef.current,
                        compressorRef.current,
                        eq3Ref.current,
                        pitchShiftRef.current,
                        reverbRef.current,
                        distortionRef.current,
                        gainRef.current,
                        Tone.Destination
                    );
                    gainRef.current.connect(destinationRef.current as any);
                }
                setIsReady(true);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Audio setup failed');
            }
        };

        setupAudio();

        return () => {
            micRef.current?.dispose();
            noiseGateRef.current?.dispose();
            compressorRef.current?.dispose();
            eq3Ref.current?.dispose();
            pitchShiftRef.current?.dispose();
            reverbRef.current?.dispose();
            distortionRef.current?.dispose();
            gainRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (pitchShiftRef.current) pitchShiftRef.current.pitch = settings.pitchShift;
    }, [settings.pitchShift]);

    useEffect(() => {
        if (reverbRef.current) reverbRef.current.wet.value = settings.reverbMix;
    }, [settings.reverbMix]);

    useEffect(() => {
        if (distortionRef.current) distortionRef.current.distortion = settings.distortion;
    }, [settings.distortion]);

    useEffect(() => {
        if (noiseGateRef.current) noiseGateRef.current.threshold = settings.noiseGate;
    }, [settings.noiseGate]);

    useEffect(() => {
        if (compressorRef.current)
            compressorRef.current.threshold.value = -24 + (settings.compressor * 20);
    }, [settings.compressor]);

    useEffect(() => {
        if (eq3Ref.current) {
            eq3Ref.current.low.value = settings.eqLow;
            eq3Ref.current.mid.value = settings.eqMid;
            eq3Ref.current.high.value = settings.eqHigh;
        }
    }, [settings.eqLow, settings.eqMid, settings.eqHigh]);

    useEffect(() => {
        if (gainRef.current) gainRef.current.gain.value = settings.gain;
    }, [settings.gain]);

    const start = useCallback(async () => {
        try {
            await Tone.start();
            await micRef.current?.open();
        } catch (e) {
            throw new Error('Microphone access denied');
        }
    }, []);

    const stop = useCallback(() => {
        micRef.current?.close();
    }, []);

    return { isReady, error, start, stop, destinationRef: destinationRef.current };
};
