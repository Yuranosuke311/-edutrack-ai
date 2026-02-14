// 層: types層 (ドメインモデル)
// 責務: Supabase上のテーブル構造に対応するTypeScript型定義を集約

export type Role = "teacher" | "admin";

// profiles テーブル（Auth と 1:1）
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

// 後方互換性のため User もエクスポート（将来的に削除予定）
export type User = Profile;

// students テーブル
export interface Student {
  id: string;
  name: string;
  grade_level: string | null;
  teacher_id: string | null; // FK → profiles.id
  student_email: string | null;
  parent_email: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  lesson_date: string;
  status: "present" | "absent" | "late";
  memo: string | null;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  test_name: string;
  score: number;
  max_score: number;
  comment: string | null;
  test_date: string;
  created_at: string;
}

// feedbacks テーブル
export interface Feedback {
  id: string;
  student_id: string; // FK → students.id
  content: string;
  sent: boolean;
  sent_at: string | null;
  send_to_email: string | null; // メール送信時の実際の送信先アドレス（トレーサビリティ確保）
  created_by: string; // FK → profiles.id
  created_at: string;
}

