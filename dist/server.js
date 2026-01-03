// src/server/index.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
var app = new Hono();
app.get("/api/hello", (c) => {
  return c.json({ message: "Hello from Hono!" });
});
app.get("/api/presets", (c) => {
  return c.json({
    presets: [
      {
        id: "original",
        name: "\u30C7\u30D5\u30A9\u30EB\u30C8",
        pitch: 0,
        reverb: 0,
        distortion: 0,
        noiseGate: -50,
        compressor: 0,
        eq: { low: 0, mid: 0, high: 0 },
        description: "\u5909\u66F4\u306A\u3057"
      },
      { id: "male-to-female", name: "\u7537\u58F0\u2192\u5973\u58F0", pitch: 5, reverb: 0.1, distortion: 0, description: "\u9AD8\u3081\u306E\u30D4\u30C3\u30C1\u3067\u5973\u6027\u7684\u306B" },
      { id: "female-to-male", name: "\u5973\u58F0\u2192\u7537\u58F0", pitch: -5, reverb: 0.1, distortion: 0, description: "\u4F4E\u3081\u306E\u30D4\u30C3\u30C1\u3067\u7537\u6027\u7684\u306B" },
      { id: "robot", name: "\u30ED\u30DC\u30C3\u30C8", pitch: 0, reverb: 0.3, distortion: 0.4, description: "\u6A5F\u68B0\u7684\u306A\u97F3\u58F0" },
      { id: "cave", name: "\u6D1E\u7A9F", pitch: -2, reverb: 0.8, distortion: 0, description: "\u5E83\u3044\u7A7A\u9593\u306E\u97FF\u304D" },
      { id: "monster", name: "\u30E2\u30F3\u30B9\u30BF\u30FC", pitch: -8, reverb: 0.5, distortion: 0.3, description: "\u4F4E\u97F3\u3067\u602A\u7269\u306E\u3088\u3046\u306A\u58F0" }
    ]
  });
});
app.use("*", serveStatic({ root: "./dist" }));
var port = 3e3;
console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port
});
var server_default = app;
export {
  server_default as default
};
