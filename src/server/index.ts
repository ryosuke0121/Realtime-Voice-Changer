import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Hono!' })
})

app.get('/api/presets', (c) => {
  return c.json({
    presets: [
      {
        id: 'original',
        name: 'デフォルト',
        pitch: 0,
        reverb: 0,
        distortion: 0,
        noiseGate: -50,
        compressor: 0,
        eq: { low: 0, mid: 0, high: 0 },
        description: '変更なし'
      },
      { id: 'male-to-female', name: '男声→女声', pitch: 5, reverb: 0.1, distortion: 0, description: '高めのピッチで女性的に' },
      { id: 'female-to-male', name: '女声→男声', pitch: -5, reverb: 0.1, distortion: 0, description: '低めのピッチで男性的に' },
      { id: 'robot', name: 'ロボット', pitch: 0, reverb: 0.3, distortion: 0.4, description: '機械的な音声' },
      { id: 'cave', name: '洞窟', pitch: -2, reverb: 0.8, distortion: 0, description: '広い空間の響き' },
      { id: 'monster', name: 'モンスター', pitch: -8, reverb: 0.5, distortion: 0.3, description: '低音で怪物のような声' },
    ]
  })
})

app.use('*', serveStatic({ root: './dist' }))

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app
