import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff, Download } from 'lucide-react';
import { getSupportedRecordingMimeType } from '../utils/recording';
import {
    saveChunk,
    loadChunks,
    clearChunks,
    getActiveSessionId,
    setActiveSessionId,
    clearActiveSessionId,
} from '../utils/recordingDb';
import Mp3EncoderWorker from '../workers/mp3-encoder.worker?worker';

const RECORDING_TIMESLICE_MS = 5000;

interface RecorderProps {
    isRecording: boolean;
    destinationNode: MediaStreamAudioDestinationNode | null;
    onStartRecording: () => void;
    onStopRecording: () => void;
}

export const Recorder: React.FC<RecorderProps> = ({
    isRecording,
    destinationNode,
    onStartRecording,
    onStopRecording,
}) => {
    const [isRecordingToFile, setIsRecordingToFile] = useState(false);
    const [isEncoding, setIsEncoding] = useState(false);
    const [recoveredSessionId, setRecoveredSessionId] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingMimeTypeRef = useRef('');
    const sessionIdRef = useRef<string>('');

    // On mount: check for an incomplete previous session in IndexedDB (Fix 3)
    useEffect(() => {
        const prevSession = getActiveSessionId();
        if (prevSession) {
            setRecoveredSessionId(prevSession);
        }
    }, []);

    const startRecordingSession = async () => {
        if (!isRecording) {
            onStartRecording();
        }
        setIsPendingRecord(true);
    };

    const [isPendingRecord, setIsPendingRecord] = useState(false);

    React.useEffect(() => {
        if (isPendingRecord && isRecording && destinationNode) {
            const sessionId = `session-${Date.now()}`;
            sessionIdRef.current = sessionId;
            setActiveSessionId(sessionId);

            const supportedMimeType = getSupportedRecordingMimeType((mimeType) => MediaRecorder.isTypeSupported(mimeType));
            const mediaRecorder = supportedMimeType
                ? new MediaRecorder(destinationNode.stream, { mimeType: supportedMimeType })
                : new MediaRecorder(destinationNode.stream);
            recordingMimeTypeRef.current = mediaRecorder.mimeType || supportedMimeType || '';

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    // Persist chunk to IndexedDB immediately (Fix 2 & 3)
                    void saveChunk(sessionId, e.data).catch(() => { });
                }
            };

            // Use timeslice to get periodic chunks for streaming IndexedDB persistence
            mediaRecorder.start(RECORDING_TIMESLICE_MS);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecordingToFile(true);
            setIsPendingRecord(false);
        }
    }, [isPendingRecord, isRecording, destinationNode]);


    const stopRecordingSession = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = () => {
                void (async () => {
                    try {
                        setIsEncoding(true);
                        await downloadRecording(sessionIdRef.current, recordingMimeTypeRef.current);
                    } catch (error) {
                        console.error('Failed to save recording as MP3:', error);
                    } finally {
                        setIsEncoding(false);
                        await clearChunks(sessionIdRef.current);
                        clearActiveSessionId();
                        cleanup();
                    }
                })();
            };
            mediaRecorderRef.current.stop();
        } else {
            cleanup();
        }
    };

    const cleanup = () => {
        setIsRecordingToFile(false);
        onStopRecording();
    };

    const handleRecoverSession = async () => {
        if (!recoveredSessionId) return;
        try {
            setIsEncoding(true);
            await downloadRecording(recoveredSessionId, '');
        } catch (error) {
            console.error('Failed to recover recording:', error);
        } finally {
            await clearChunks(recoveredSessionId);
            clearActiveSessionId();
            setRecoveredSessionId(null);
            setIsEncoding(false);
        }
    };

    const handleDiscardRecovery = async () => {
        if (!recoveredSessionId) return;
        await clearChunks(recoveredSessionId);
        clearActiveSessionId();
        setRecoveredSessionId(null);
    };

    const handleMonitorStart = () => {
        onStartRecording();
    };

    const handleMonitorStop = () => {
        onStopRecording();
    };

    return (
        <div className="flex flex-col items-center gap-4 mb-8">
            {recoveredSessionId && !isEncoding && (
                <div className="w-full p-3 rounded-lg bg-yellow-500/10 border border-yellow-500 text-yellow-400 flex items-center justify-between">
                    <span>保存されていない録音データが見つかりました。</span>
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={handleRecoverSession}
                            className="px-3 py-1 rounded bg-yellow-500 text-black font-semibold text-sm"
                        >
                            復元する
                        </button>
                        <button
                            onClick={handleDiscardRecovery}
                            className="px-3 py-1 rounded bg-slate-600 text-white font-semibold text-sm"
                        >
                            破棄する
                        </button>
                    </div>
                </div>
            )}

            {isEncoding && (
                <div className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500 text-blue-400 text-center animate-pulse">
                    MP3 に変換中...
                </div>
            )}

            <div className="flex justify-center gap-4">
                {!isRecording && !isEncoding && (
                    <>
                        <button onClick={handleMonitorStart} className="btn-primary flex items-center gap-2">
                            <Mic size={20} /> 声をモニターする
                        </button>
                        <button onClick={startRecordingSession} className="btn-primary flex items-center gap-2">
                            <Mic size={20} /> 録音する
                        </button>
                    </>
                )}

                {isRecording && !isRecordingToFile && (
                    <button onClick={handleMonitorStop} className="btn-danger flex items-center gap-2">
                        <MicOff size={20} /> モニター停止
                    </button>
                )}

                {isRecording && isRecordingToFile && (
                    <button onClick={stopRecordingSession} className="btn-danger flex items-center gap-2 animate-pulse">
                        <Download size={20} /> 録音停止＆保存
                    </button>
                )}
            </div>
        </div>
    );
};

const downloadRecording = async (sessionId: string, mimeType: string): Promise<void> => {
    const chunks = await loadChunks(sessionId);
    if (chunks.length === 0) return;

    const sourceBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
    const mp3Blob = await convertToMp3Blob(sourceBlob);
    const url = URL.createObjectURL(mp3Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-recording-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Fix 4: MP3 encoding offloaded to a Web Worker to prevent UI freeze
const convertToMp3Blob = async (sourceBlob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    try {
        const arrayBuffer = await sourceBlob.arrayBuffer();
        const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
        const channels = Math.min(decodedAudio.numberOfChannels, 2);

        // Extract and copy channel data before transferring to the worker
        const channelData: Float32Array[] = [];
        for (let i = 0; i < channels; i++) {
            channelData.push(decodedAudio.getChannelData(i).slice());
        }

        return await new Promise<Blob>((resolve, reject) => {
            const worker = new Mp3EncoderWorker();
            worker.onmessage = (event: MessageEvent<{ mp3Data: Uint8Array[] }>) => {
                const blob = new Blob(event.data.mp3Data as BlobPart[], { type: 'audio/mpeg' });
                worker.terminate();
                resolve(blob);
            };
            worker.onerror = (e: ErrorEvent) => {
                console.error('MP3 encoding worker error:', e);
                worker.terminate();
                reject(new Error('MP3 encoding failed in worker'));
            };
            const transferable = channelData.map(d => d.buffer as ArrayBuffer);
            worker.postMessage(
                { channels, sampleRate: decodedAudio.sampleRate, channelData },
                transferable,
            );
        });
    } finally {
        await audioContext.close();
    }
};

