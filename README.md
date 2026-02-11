# EduTrack AI (WIP)

オンライン教師向けの出席管理・成績記録・AIフィードバック支援アプリです。

## セットアップ

```bash
npm install
npm run dev
```

## 必要な環境変数

ローカルでは `.env.local` に設定してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
```

Vercel では「Project Settings → Environment Variables」から同名の環境変数を登録してください。

