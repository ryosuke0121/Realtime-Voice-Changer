# Realtime Voice Changer

Web Audio API (Tone.js) と Hono を活用した、リアルタイム音声加工 Web アプリケーションです。

## 機能
- リアルタイム音声加工（ピッチシフト、リバーブ、歪み、EQ等）
- 6種類のプリセット（男声→女声、女声→男声、ロボット、洞窟、モンスター等）
- 録音・ダウンロード機能
- 設定の自動保存機能

## 技術スタック
- フロントエンド: React + TypeScript + Vite
- サーバーサイド: Hono (Node.js / Cloudflare Pages対応)
- 音声処理: Tone.js (Web Audio API)
- スタイリング: Tailwind CSS

## セットアップ

```bash
# インストール
npm install

# 開発サーバー起動
npm run dev
```

開発サーバー起動後、http://localhost:5173 を開いてください。

## ライセンス
本プロジェクトはMITライセンスの下で公開されています。使用しているライブラリのライセンスは以下の通りです：
- React: MIT
- Hono: MIT
- Tone.js: MIT
- Lucide React: ISC
- Tailwind CSS: MIT
