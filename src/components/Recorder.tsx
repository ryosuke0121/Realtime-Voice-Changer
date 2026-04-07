import React, { useRef, useState } from 'react';
import { Mic, MicOff, Download } from 'lucide-react';
import { Mp3Encoder } from 'lamejs';
import { getSupportedRecordingMimeType } from '../utils/recording';

const MP3_BITRATE_KBPS = 128;
const MP3_SAMPLE_BLOCK_SIZE = 1152;


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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingMimeTypeRef = useRef('');
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecordingSession = async () => {
        if (!isRecording) {
            onStartRecording();
        }
        setIsPendingRecord(true);
    };

    const [isPendingRecord, setIsPendingRecord] = useState(false);

    React.useEffect(() => {
        if (isPendingRecord && isRecording && destinationNode) {
            audioChunksRef.current = [];
            const supportedMimeType = getSupportedRecordingMimeType((mimeType) => MediaRecorder.isTypeSupported(mimeType));
            const mediaRecorder = supportedMimeType
                ? new MediaRecorder(destinationNode.stream, { mimeType: supportedMimeType })
                : new MediaRecorder(destinationNode.stream);
            recordingMimeTypeRef.current = mediaRecorder.mimeType || supportedMimeType || '';

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.start();
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
                        await downloadRecording();
                    } catch (error) {
                        console.error('Failed to save recording as MP3:', error);
                    } finally {
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

    const downloadRecording = async () => {
        if (audioChunksRef.current.length === 0) return;
        const sourceBlob = new Blob(audioChunksRef.current, { type: recordingMimeTypeRef.current || 'audio/webm' });
        const mp3Blob = await convertToMp3Blob(sourceBlob);
        const url = URL.createObjectURL(mp3Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice-recording-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        audioChunksRef.current = [];
    };

    const handleMonitorStart = () => {
        onStartRecording();
    };

    const handleMonitorStop = () => {
        onStopRecording();
    };

    return (
        <div className="flex justify-center gap-4 mb-8">
            {!isRecording && (
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
    );
};

const convertToMp3Blob = async (sourceBlob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    try {
        const arrayBuffer = await sourceBlob.arrayBuffer();
        const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
        // lamejs supports up to stereo input.
        const channels = Math.min(decodedAudio.numberOfChannels, 2);
        const mp3Encoder = new Mp3Encoder(channels, decodedAudio.sampleRate, MP3_BITRATE_KBPS);
        const mp3Data: BlobPart[] = [];

        if (channels === 1) {
            const mono = convertFloat32ToInt16(decodedAudio.getChannelData(0));
            for (let i = 0; i < mono.length; i += MP3_SAMPLE_BLOCK_SIZE) {
                const mp3Buffer = mp3Encoder.encodeBuffer(mono.subarray(i, i + MP3_SAMPLE_BLOCK_SIZE));
                if (mp3Buffer.length > 0) {
                    mp3Data.push(new Uint8Array(mp3Buffer));
                }
            }
        } else {
            const left = convertFloat32ToInt16(decodedAudio.getChannelData(0));
            const right = convertFloat32ToInt16(decodedAudio.getChannelData(1));
            for (let i = 0; i < left.length; i += MP3_SAMPLE_BLOCK_SIZE) {
                const mp3Buffer = mp3Encoder.encodeBuffer(
                    left.subarray(i, i + MP3_SAMPLE_BLOCK_SIZE),
                    right.subarray(i, i + MP3_SAMPLE_BLOCK_SIZE),
                );
                if (mp3Buffer.length > 0) {
                    mp3Data.push(new Uint8Array(mp3Buffer));
                }
            }
        }

        const endBuffer = mp3Encoder.flush();
        if (endBuffer.length > 0) {
            mp3Data.push(new Uint8Array(endBuffer));
        }

        return new Blob(mp3Data, { type: 'audio/mpeg' });
    } finally {
        await audioContext.close();
    }
};

const convertFloat32ToInt16 = (input: Float32Array): Int16Array => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
};
