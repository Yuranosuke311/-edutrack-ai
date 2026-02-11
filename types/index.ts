export type Role = "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  grade_level: string | null;
  teacher_id: string | null;
  student_email: string | null;
  parent_email: string | null;
  memo: string | null;
  created_at: string;
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

export interface Feedback {
  id: string;
  student_id: string;
  content: string;
  sent: boolean;
  sent_at: string | null;
  created_by: string;
  created_at: string;
}

