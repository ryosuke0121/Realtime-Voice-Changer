const RECORDING_MIME_TYPE_CANDIDATES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
];

export const getSupportedRecordingMimeType = (isTypeSupported: (mimeType: string) => boolean): string => {
    return RECORDING_MIME_TYPE_CANDIDATES.find((mimeType) => isTypeSupported(mimeType)) ?? '';
};
