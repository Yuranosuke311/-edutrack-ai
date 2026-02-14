# テストデータのセットアップガイド

フィードバック自動生成機能をテストするためのダミーデータの投入方法です。

## 前提条件

- Supabase のテーブルが作成済みであること
- **ログイン済みのユーザー（profiles テーブルにレコードがあること）**

⚠️ **重要**: `profiles` テーブルに直接データを入れることはできません。必ず先に Supabase Auth でユーザーを作成してください。

### ユーザー作成方法

1. **アプリのサインアップ画面から作成（推奨）**
   - `/auth/signup` にアクセス
   - フォームに入力して登録
   - これで `auth.users` と `profiles` の両方に自動的にレコードが作成されます

2. **Supabase Dashboard から作成**
   - Authentication → Users → Add user
   - ユーザー作成後、Table Editor で `profiles` テーブルに手動でレコードを追加

## 方法1: Supabase Table Editor で直接入力（推奨・簡単）

### ステップ1: 自分のユーザーIDを確認

**重要**: まず、アプリのサインアップ画面（`/auth/signup`）からユーザーを作成してください。

1. Supabase ダッシュボード → **Table Editor** → **profiles** テーブルを開く
2. 自分のレコードの `id` をコピー（UUID形式）
   - レコードが存在しない場合は、先に `/auth/signup` からユーザーを作成してください

### ステップ2: 生徒データを追加

1. **Table Editor** → **students** テーブルを開く
2. 「Insert row」をクリック
3. 以下の情報を入力：
   - `name`: `テスト生徒 太郎`
   - `grade_level`: `中3`
   - `teacher_id`: （ステップ1でコピーした自分のUUIDを貼り付け）
   - `parent_email`: `parent@example.com`（テスト用）
   - その他は空欄でOK
4. 「Save」をクリック
5. 作成された生徒の `id` をコピー（後で使います）

### ステップ3: 出席データを追加（任意・より良いフィードバック生成のため）

1. **Table Editor** → **attendances** テーブルを開く
2. 「Insert row」をクリック
3. 複数回追加して、以下のようなデータを作成：

| lesson_date | status | memo |
|------------|--------|------|
| 2025-01-15 | present | 積極的に質問していました |
| 2025-01-22 | present | 宿題を完璧に提出 |
| 2025-01-29 | late | 5分遅刻 |
| 2025-02-05 | present | 理解度が向上しています |

- `student_id`: （ステップ2でコピーした生徒ID）
- `lesson_date`: 上記の日付
- `status`: `present`, `absent`, `late` のいずれか
- `memo`: 任意のメモ

### ステップ4: 成績データを追加（任意・より良いフィードバック生成のため）

1. **Table Editor** → **grades** テーブルを開く
2. 「Insert row」をクリック
3. 複数回追加して、以下のようなデータを作成：

| test_name | score | max_score | test_date | comment |
|-----------|-------|-----------|-----------|---------|
| 数学中間テスト | 85 | 100 | 2025-01-20 | 計算ミスが目立ちました |
| 英語小テスト | 92 | 100 | 2025-01-25 | 単語力が向上しています |
| 数学期末テスト | 78 | 100 | 2025-02-01 | 応用問題で苦戦 |

- `student_id`: （ステップ2でコピーした生徒ID）
- `test_name`: テスト名
- `score`: 得点
- `max_score`: 満点
- `test_date`: 受験日
- `comment`: 任意のコメント

### ステップ5: アプリでテスト

1. アプリにログイン
2. `/dashboard/students` にアクセス
3. 作成した生徒の「詳細」をクリック
4. 「AIフィードバック」セクションで「AIで生成」ボタンをクリック
5. フィードバック文が生成されることを確認

## 方法2: SQL で一括投入（効率的）

Supabase の **SQL Editor** で以下のSQLを実行すると、テストデータが一括で投入されます。

```sql
-- 1. 自分のユーザーIDを取得（profiles テーブルから）
-- 以下のクエリで自分のIDを確認してください
-- SELECT id FROM profiles WHERE email = 'your-email@example.com';

-- 2. 上記で取得したIDを @your_user_id の部分に置き換えて実行

-- テスト生徒の作成
INSERT INTO public.students (name, grade_level, teacher_id, parent_email)
VALUES (
  'テスト生徒 太郎',
  '中3',
  '@your_user_id', -- ここを自分のUUIDに置き換え
  'parent@example.com'
)
RETURNING id;

-- 上記で返された生徒IDを @student_id に置き換えて以下を実行

-- 出席データの追加
INSERT INTO public.attendances (student_id, lesson_date, status, memo)
VALUES
  (@student_id, '2025-01-15', 'present', '積極的に質問していました'),
  (@student_id, '2025-01-22', 'present', '宿題を完璧に提出'),
  (@student_id, '2025-01-29', 'late', '5分遅刻'),
  (@student_id, '2025-02-05', 'present', '理解度が向上しています');

-- 成績データの追加
INSERT INTO public.grades (student_id, test_name, score, max_score, test_date, comment)
VALUES
  (@student_id, '数学中間テスト', 85, 100, '2025-01-20', '計算ミスが目立ちました'),
  (@student_id, '英語小テスト', 92, 100, '2025-01-25', '単語力が向上しています'),
  (@student_id, '数学期末テスト', 78, 100, '2025-02-01', '応用問題で苦戦');
```

### SQL実行の手順

1. まず自分のユーザーIDを取得：
   ```sql
   SELECT id, name, email FROM profiles;
   ```
   自分の `id` をコピー

2. 生徒を作成（自分のIDを置き換え）：
   ```sql
   INSERT INTO public.students (name, grade_level, teacher_id, parent_email)
   VALUES (
     'テスト生徒 太郎',
     '中3',
     'ここに自分のUUIDを貼り付け',
     'parent@example.com'
   )
   RETURNING id;
   ```
   返された `id` をコピー

3. 出席・成績データを追加（生徒IDを置き換え）：
   ```sql
   -- 上記のINSERT文を実行（student_id の部分を置き換え）
   ```

## トラブルシューティング

### エラー: "violates foreign key constraint"
- `teacher_id` が正しいUUIDか確認してください
- `profiles` テーブルに自分のレコードが存在するか確認してください

### エラー: "permission denied"
- RLSポリシーが正しく設定されているか確認してください
- ログインしているユーザーのIDと `teacher_id` が一致しているか確認してください

### フィードバック生成が失敗する
- OpenAI API Key が `.env.local` に設定されているか確認
- 生徒IDが正しいか確認（URLの `/dashboard/students/[id]` の部分）
- ブラウザのコンソールでエラーメッセージを確認

## 次のステップ

テストデータが投入できたら：
1. `/dashboard/students` で生徒一覧を確認
2. 生徒詳細ページで「AIフィードバック生成」をテスト
3. 生成されたフィードバックの品質を確認
4. 必要に応じて出席・成績データを追加して再テスト
