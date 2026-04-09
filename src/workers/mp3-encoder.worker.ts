import { Mp3Encoder } from 'lamejs';

const MP3_BITRATE_KBPS = 128;
const MP3_SAMPLE_BLOCK_SIZE = 1152;

interface EncodeRequest {
    channels: number;
    sampleRate: number;
    channelData: Float32Array[];
}

interface EncodeResponse {
    mp3Data: Uint8Array[];
}

const convertFloat32ToInt16 = (input: Float32Array): Int16Array => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
};

self.onmessage = (event: MessageEvent<EncodeRequest>) => {
    const { channels, sampleRate, channelData } = event.data;
    const mp3Encoder = new Mp3Encoder(channels, sampleRate, MP3_BITRATE_KBPS);
    const mp3Data: Uint8Array[] = [];

    if (channels === 1) {
        const mono = convertFloat32ToInt16(channelData[0]);
        for (let i = 0; i < mono.length; i += MP3_SAMPLE_BLOCK_SIZE) {
            const mp3Buffer = mp3Encoder.encodeBuffer(mono.subarray(i, i + MP3_SAMPLE_BLOCK_SIZE));
            if (mp3Buffer.length > 0) mp3Data.push(new Uint8Array(mp3Buffer));
        }
    } else {
        const left = convertFloat32ToInt16(channelData[0]);
        const right = convertFloat32ToInt16(channelData[1]);
        for (let i = 0; i < left.length; i += MP3_SAMPLE_BLOCK_SIZE) {
            const mp3Buffer = mp3Encoder.encodeBuffer(
                left.subarray(i, i + MP3_SAMPLE_BLOCK_SIZE),
                right.subarray(i, i + MP3_SAMPLE_BLOCK_SIZE),
            );
            if (mp3Buffer.length > 0) mp3Data.push(new Uint8Array(mp3Buffer));
        }
    }

    const endBuffer = mp3Encoder.flush();
    if (endBuffer.length > 0) mp3Data.push(new Uint8Array(endBuffer));

    const response: EncodeResponse = { mp3Data };
    const transferable = mp3Data.map(u8 => u8.buffer as ArrayBuffer);
    self.postMessage(response, { transfer: transferable });
};
