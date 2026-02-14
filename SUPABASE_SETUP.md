# Supabase セットアップガイド

## 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com/) にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワードを設定
4. リージョンを選択（例: Northeast Asia (Tokyo)）

## 2. 環境変数の取得

Supabase ダッシュボードの **Project Settings → API** から以下を取得：

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** キー → `SUPABASE_SERVICE_ROLE_KEY`（サーバー側でのみ使用）

## 3. データベーステーブルの作成

Supabase ダッシュボードの **SQL Editor** で以下のSQLを**上から順に**実行してください。

### 3-1. profiles テーブル（Auth 連携）

```sql
-- updated_at を自動更新するトリガー関数（最初に作成）
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles テーブル（auth.users と 1:1）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'teacher' check (role in ('teacher', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 既存のトリガーを削除してから再作成（エラー回避のため）
drop trigger if exists update_profiles_updated_at on public.profiles;

-- profiles テーブルにトリガーを設定
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function update_updated_at_column();

-- RLS有効化
alter table public.profiles enable row level security;

-- サインアップ時に自分のプロフィールを1件だけ追加可能（必須）
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- 全ユーザーが自分の情報を参照可能
create policy "Profiles can view own data"
on public.profiles
for select
using (auth.uid() = id);

-- 全ユーザーが自分の情報を更新可能
create policy "Profiles can update own data"
on public.profiles
for update
using (auth.uid() = id);

-- 管理者は全プロフィールを参照可能
create policy "Admins can view all profiles"
on public.profiles
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- 管理者は全プロフィールを更新可能
create policy "Admins can update all profiles"
on public.profiles
for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
```

### 3-2. students テーブル

```sql
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_level text,
  teacher_id uuid references public.profiles(id) on delete set null,
  student_email text,
  parent_email text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 既存のトリガーを削除してから再作成（エラー回避のため）
drop trigger if exists update_students_updated_at on public.students;

-- updated_at を自動更新するトリガー
create trigger update_students_updated_at
before update on public.students
for each row
execute function update_updated_at_column();

alter table public.students enable row level security;

-- 教師は自分の担当生徒のみ参照可能
create policy "Teachers can view their students"
on public.students
for select
using (
  teacher_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- 教師は自分の担当生徒を追加可能
create policy "Teachers can insert their students"
on public.students
for insert
with check (
  teacher_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- 教師は自分の担当生徒を更新可能
create policy "Teachers can update their students"
on public.students
for update
using (
  teacher_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  teacher_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- 管理者のみ削除可能
create policy "Admins can delete students"
on public.students
for delete
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
```

### 3-3. attendances テーブル

```sql
create table if not exists public.attendances (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_date date not null,
  status text not null check (status in ('present', 'absent', 'late')),
  memo text,
  created_at timestamptz not null default now(),
  constraint unique_attendance_per_day unique (student_id, lesson_date)
);

alter table public.attendances enable row level security;

-- 教師・管理者は担当生徒の出席データを参照可能
create policy "Attendances select for teacher or admin"
on public.attendances
for select
using (
  exists (
    select 1 from public.students
    where students.id = attendances.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒の出席データを追加可能
create policy "Attendances insert for teacher or admin"
on public.attendances
for insert
with check (
  exists (
    select 1 from public.students
    where students.id = attendances.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒の出席データを更新可能
create policy "Attendances update for teacher or admin"
on public.attendances
for update
using (
  exists (
    select 1 from public.students
    where students.id = attendances.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒の出席データを削除可能
create policy "Attendances delete for teacher or admin"
on public.attendances
for delete
using (
  exists (
    select 1 from public.students
    where students.id = attendances.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);
```

### 3-4. grades テーブル

```sql
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  test_name text not null,
  score integer not null,
  max_score integer not null,
  comment text,
  test_date date not null,
  created_at timestamptz not null default now(),
  constraint score_check check (score <= max_score)
);

alter table public.grades enable row level security;

-- 教師・管理者は担当生徒の成績データを参照可能
create policy "Grades select for teacher or admin"
on public.grades
for select
using (
  exists (
    select 1 from public.students
    where students.id = grades.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒の成績データを追加可能
create policy "Grades insert for teacher or admin"
on public.grades
for insert
with check (
  exists (
    select 1 from public.students
    where students.id = grades.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒の成績データを更新可能
create policy "Grades update for teacher or admin"
on public.grades
for update
using (
  exists (
    select 1 from public.students
    where students.id = grades.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒の成績データを削除可能
create policy "Grades delete for teacher or admin"
on public.grades
for delete
using (
  exists (
    select 1 from public.students
    where students.id = grades.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);
```

### 3-5. feedbacks テーブル

```sql
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  content text not null,
  sent boolean not null default false,
  sent_at timestamptz,
  send_to_email text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table public.feedbacks enable row level security;

-- 教師・管理者は担当生徒のフィードバックを参照可能
create policy "Feedbacks select for teacher or admin"
on public.feedbacks
for select
using (
  exists (
    select 1 from public.students
    where students.id = feedbacks.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);

-- 教師・管理者は担当生徒のフィードバックを追加可能
create policy "Feedbacks insert for teacher or admin"
on public.feedbacks
for insert
with check (
  exists (
    select 1 from public.students
    where students.id = feedbacks.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
  and created_by = auth.uid()
);

-- 教師・管理者は担当生徒のフィードバックを更新可能
create policy "Feedbacks update for teacher or admin"
on public.feedbacks
for update
using (
  exists (
    select 1 from public.students
    where students.id = feedbacks.student_id
      and (
        students.teacher_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
  )
);
```

## 4. 環境変数の設定

`.env.local` ファイルに以下を設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

## 5. 動作確認

1. `npm run dev` でアプリを起動
2. `/auth/signup` で新規登録（profiles テーブルに自動でレコードが作成される）
3. `/auth/login` でログイン
4. `/dashboard` にアクセスできることを確認

## 6. テーブル構造の確認

Supabase ダッシュボードの **Table Editor** で以下を確認：

- ✅ `profiles` テーブルが作成されている
- ✅ `students` テーブルが作成されている
- ✅ `attendances` テーブルが作成されている
- ✅ `grades` テーブルが作成されている
- ✅ `feedbacks` テーブルが作成されている
- ✅ 各テーブルのRLSが有効になっている

## 注意事項

- `profiles` テーブルの `id` は `auth.users.id` と一致させる必要があります
- サインアップ時にアプリ側で `profiles` テーブルにレコードを追加する処理が必要です
- `updated_at` はトリガーで自動更新されます
- `feedbacks.created_by` は `ON DELETE RESTRICT` のため、プロフィール削除時はエラーになります
