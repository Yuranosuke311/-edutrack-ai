# EduTrack AI

オンライン教師向けの出席管理・成績記録・AIフィードバック支援アプリです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定してください。

```bash
# Supabase設定（Project Settings → API から取得）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini API Key（https://aistudio.google.com/apikey から取得）
GEMINI_API_KEY=your-gemini-api-key

# Resend（メール送信。https://resend.com/api-keys でキー発行）
RESEND_API_KEY=re_xxxx
# 本番ではドメイン認証後、送信元を指定（例: EduTrack <noreply@yourdomain.com>）
# RESEND_FROM=EduTrack AI <onboarding@resend.dev>
```

### 3. Supabase データベースのセットアップ

詳細は `SUPABASE_SETUP.md` を参照してください。

1. Supabase プロジェクトを作成
2. SQL Editor でテーブルとRLSポリシーを作成
3. 環境変数を `.env.local` に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Gemini API Key の取得方法

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. Google アカウントでログイン
3. 「Create API key」でキーを発行
4. 生成されたキーをコピーして `.env.local` の `GEMINI_API_KEY` に設定

**注意**: キーは安全に保管し、リポジトリにコミットしないでください。

## Vercel へのデプロイ

1. GitHub リポジトリにプッシュ
2. Vercel でプロジェクトをインポート
3. 「Project Settings → Environment Variables」から環境変数を設定
4. デプロイ完了

詳細な手順は `SUPABASE_SETUP.md` を参照してください。

