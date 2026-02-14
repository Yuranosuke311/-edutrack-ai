# トラブルシューティングガイド

## エラー: "new row violates row-level security policy for table 'profiles'"

### 原因

サインアップ時に `profiles` テーブルへレコードを挿入しようとした際、RLS（Row Level Security）で **INSERT が許可されていない** ために発生します。`profiles` には「自分のプロフィールを1件だけ追加する」ための INSERT ポリシーが必要です。

### 解決方法

Supabase ダッシュボードの **SQL Editor** で、**次のブロックだけ**をコピーして実行してください（既存の SELECT/UPDATE ポリシーは触りません）。

```sql
-- 既に同じ名前のポリシーがあれば削除してから作成（2回目以降の実行でもエラーにならない）
drop policy if exists "Users can insert own profile" on public.profiles;

-- サインアップ時に自分のプロフィールを1件だけ追加できるようにする
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);
```

- **「Profiles can view own data」など既存ポリシーをまとめて実行しないでください。** 上記の 2 行（drop + create）だけを実行してください。
- 実行後、もう一度アプリのサインアップ画面から登録を試してください。

---

## エラー: "violates foreign key constraint profiles_id_fkey"

### 原因

`profiles` テーブルに直接データを挿入しようとした際に、対応する `auth.users` レコードが存在しない場合に発生します。

`profiles` テーブルは `auth.users(id)` を外部キーとして参照しているため、**必ず先に Supabase Auth でユーザーを作成する必要があります**。

### 解決方法

#### 方法1: アプリのサインアップ画面から作成（推奨）

1. アプリを起動: `npm run dev`
2. `/auth/signup` にアクセス
3. フォームに入力して登録
   - 氏名: 任意
   - メールアドレス: 任意（例: `test@example.com`）
   - パスワード: 6文字以上
4. 「登録する」をクリック

これで以下が自動的に実行されます：
- `auth.users` にユーザーが作成される
- `profiles` テーブルにレコードが自動挿入される

#### 方法2: Supabase Dashboard から作成

1. Supabase ダッシュボード → **Authentication** → **Users**
2. 「Add user」→「Create new user」をクリック
3. メールアドレスとパスワードを入力
4. 「Create user」をクリック
5. 作成されたユーザーの `id` (UUID) をコピー
6. **Table Editor** → **profiles** テーブルを開く
7. 「Insert row」をクリック
8. 以下を入力：
   - `id`: （ステップ5でコピーしたUUID）
   - `name`: 任意の名前
   - `email`: ステップ3で入力したメールアドレス
   - `role`: `teacher` または `admin`
9. 「Save」をクリック

### 確認方法

正しく作成されているか確認：

```sql
-- auth.users と profiles の両方にレコードがあるか確認
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.name as profile_name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;
```

両方にレコードが表示されればOKです。

## エラー: "permission denied for table profiles"

### 原因

RLS（Row Level Security）ポリシーにより、権限がない場合に発生します。

### 解決方法

1. Supabase ダッシュボード → **Table Editor** → **profiles**
2. 右上の「RLS」アイコンをクリック
3. RLSが有効になっていることを確認
4. 以下のポリシーが存在することを確認：
   - `Profiles can view own data`
   - `Profiles can update own data`
   - `Admins can view all profiles`
   - `Admins can update all profiles`

ポリシーが存在しない場合は、`SUPABASE_SETUP.md` の SQL を再実行してください。

## エラー: "relation 'profiles' does not exist"

### 原因

`profiles` テーブルがまだ作成されていません。

### 解決方法

`SUPABASE_SETUP.md` の SQL を Supabase の SQL Editor で実行してください。

## 生徒データを追加できない

### 原因

`teacher_id` が正しく設定されていない、または RLS ポリシーにより権限がない可能性があります。

### 解決方法

1. 自分のユーザーIDを確認：
   ```sql
   SELECT id, name, email FROM profiles;
   ```

2. 生徒データを追加する際、`teacher_id` に上記で取得したIDを設定

3. RLSポリシーが正しく設定されているか確認：
   - `SUPABASE_SETUP.md` の SQL を実行済みか確認

## フィードバック生成が失敗する

### 原因

- OpenAI API Key が設定されていない
- 生徒IDが間違っている
- ネットワークエラー

### 解決方法

1. `.env.local` に `OPENAI_API_KEY` が設定されているか確認
2. ブラウザの開発者ツール（F12）→ Console タブでエラーメッセージを確認
3. 生徒IDが正しいか確認（Supabase の students テーブルで確認）

## よくある質問

### Q: Table Editor から直接データを入れられない？

A: RLS が有効な場合、Table Editor からも RLS ポリシーが適用されます。自分のデータ（`teacher_id = 自分のID`）のみ追加・編集可能です。

### Q: 管理者として全データを操作したい

A: `profiles` テーブルで自分の `role` を `admin` に変更してください：

```sql
UPDATE profiles SET role = 'admin' WHERE id = '自分のUUID';
```

### Q: テスト用のユーザーを簡単に作りたい

A: アプリのサインアップ画面（`/auth/signup`）から作成するのが最も簡単です。
