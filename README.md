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

# OpenAI API Key（https://platform.openai.com/api-keys から取得）
OPENAI_API_KEY=your-openai-key

# Resend API Key（メール送信機能で使用。後で設定可）
# RESEND_API_KEY=
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

## OpenAI API Key の取得方法

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウントを作成（またはログイン）
3. 「API keys」→「Create new secret key」をクリック
4. 生成されたキーをコピーして `.env.local` の `OPENAI_API_KEY` に設定

**注意**: キーは一度しか表示されないため、必ずコピーして安全に保管してください。

## Vercel へのデプロイ

1. GitHub リポジトリにプッシュ
2. Vercel でプロジェクトをインポート
3. 「Project Settings → Environment Variables」から環境変数を設定
4. デプロイ完了

詳細な手順は `SUPABASE_SETUP.md` を参照してください。

