import React, { useRef, useState } from 'react';
import { Mic, MicOff, Download } from 'lucide-react';


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
            const mediaRecorder = new MediaRecorder(destinationNode.stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });

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
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                downloadRecording();
                cleanup();
            };
        } else {
            cleanup();
        }
    };

    const cleanup = () => {
        setIsRecordingToFile(false);
        onStopRecording();
    };

    const downloadRecording = () => {
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
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
