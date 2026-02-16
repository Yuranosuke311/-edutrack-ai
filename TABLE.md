# SQL 整合性評価（TABLE.md）

## 評価サマリ

| 項目 | 状態 | 備考 |
|------|------|------|
| コードブロック | 要修正 | 先頭 `,,,sql` → \`\`\`sql、末尾 `,,,` → \`\`\` |
| prevent_role_escalation | 要修正 | 関数がコメントアウトのままトリガーが参照しており実行時エラーになる |
| lessons テーブル | 整合 | 授業は日時指定のため `lesson_at` (timestamptz) を使用 |
| 参照整合性 (FK) | 問題なし | 全テーブル FK 妥当 |
| attendances 一意制約 | 問題なし | unique (student_id, lesson_date) で API の upsert と一致 |
| RLS ポリシー | 問題なし | 教師・管理者の役割分離と is_admin() の利用は一貫 |

## 修正内容

- コードブロックの開始・終了を \`\`\`sql / \`\`\` に修正した。
- `prevent_role_escalation()` の関数定義のコメントを外し、トリガーが参照できるようにした。
- `lessons` は授業の日時指定のため `lesson_at` (timestamptz) を使用。アプリ・型定義もこれに統一。

---

```sql

-- public スキーマの全テーブルにあるポリシーを一括削除
do $$
declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  ) loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end;
$$;

---------------------------------
---3-1. profiles テーブル（Auth 連携）
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

-- 管理者判定用ヘルパー（RLSの無限再帰を防ぐため SECURITY DEFINER で profiles を読む）
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 管理者は全プロフィールを参照可能（is_admin() を使い profiles への再参照を避ける）
create policy "Admins can view all profiles"
on public.profiles
for select
using (public.is_admin());

-- 管理者は全プロフィールを更新可能
create policy "Admins can update all profiles"
on public.profiles
for update
using (public.is_admin());

-- role の変更は管理者のみ許可（is_admin() を使用）
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if old.role is distinct from new.role then
    if not public.is_admin() then
      raise exception 'role の変更は管理者のみ行えます。';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_role_escalation_trigger on public.profiles;
create trigger prevent_role_escalation_trigger
before update on public.profiles
for each row
execute function public.prevent_role_escalation();

-- サインアップ時に auth.users へ挿入されたら public.profiles を自動作成（RLS・メール確認に依存しない）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      new.email
    ),
    new.email,
    'teacher'
  );
  return new;
exception
  when unique_violation then
    return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


---------------------------------
---3-2. students テーブル
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


---------------------------------
---3-3. attendances テーブル
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

---------------------------------
---3-4. grades テーブル
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


---------------------------------
---3-5. feedbacks テーブル
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

-------------------------------------------------
-- 自分のメールアドレスを指定して直接 admin にする
update public.profiles
set role = 'admin'
where email = 'suzukiyura0311@gmail.com';

---------------------------------------------------
---3.6 lessons テーブル（定期的な授業スケジュール）

--- 管理者が授業を登録・削除し、教師・管理者がダッシュボードのカレンダーで閲覧します。教師は担当授業のみ表示。
--- 授業は日時指定のため lesson_at (timestamptz) を使用。
-- テーブル作成
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  lesson_at timestamptz not null,
  title text,
  created_at timestamptz not null default now()
);

create index if not exists idx_lessons_lesson_at on public.lessons(lesson_at);
create index if not exists idx_lessons_teacher_id on public.lessons(teacher_id);

-- RLS 有効化
alter table public.lessons enable row level security;

-- 管理者: 全操作可（is_admin() を使用している場合はその関数が存在する前提）
create policy "Admins can do everything on lessons"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

-- 教師: 自分が担当の授業のみ SELECT
create policy "Teachers can view own lessons"
  on public.lessons for select
  using (teacher_id = auth.uid());
```
