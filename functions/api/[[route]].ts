import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

app.get('/api/presets', (c) => {
    return c.json({
        success: true,
        presets: [
            {
                id: 'original',
                name: 'オリジナル',
                pitch: 0,
                reverb: 0,
                distortion: 0,
                description: '変更なし'
            },
            {
                id: 'male-to-female',
                name: '男声→女声',
                pitch: 5,
                reverb: 0.1,
                distortion: 0,
                description: '高めのピッチで女性的に'
            },
            {
                id: 'female-to-male',
                name: '女声→男声',
                pitch: -5,
                reverb: 0.1,
                distortion: 0,
                description: '低めのピッチで男性的に'
            },
            {
                id: 'robot',
                name: 'ロボット',
                pitch: 0,
                reverb: 0.3,
                distortion: 0.4,
                description: '機械的な音声'
            },
            {
                id: 'cave',
                name: '洞窟',
                pitch: -2,
                reverb: 0.8,
                distortion: 0,
                description: '広い空間の響き'
            },
            {
                id: 'monster',
                name: 'モンスター',
                pitch: -8,
                reverb: 0.5,
                distortion: 0.3,
                description: '低音で怪物のような声'
            }
        ]
    });
});

app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.notFound((c) => {
    return c.json({
        success: false,
        error: 'Not Found'
    }, 404);
});

app.onError((err, c) => {
    return c.json({
        success: false,
        error: 'Internal Server Error'
    }, 500);
});

export const onRequest = handle(app);
