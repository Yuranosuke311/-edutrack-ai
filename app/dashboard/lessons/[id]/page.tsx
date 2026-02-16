// 層: ページ層 (ダッシュボード)
// 責務: 授業1件の詳細と、その日の担当生徒の出席登録・授業メモ

import { getCurrentProfile } from "@/lib/profile";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LessonAttendanceForm from "@/components/lessons/LessonAttendanceForm";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function LessonDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");

  const id = params?.id;
  if (!id) notFound();

  const supabase = createSupabaseServerClient();

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, lesson_at, teacher_id, title")
    .eq("id", id)
    .single();

  if (lessonError || !lesson) notFound();

  // 教師は自分の授業のみ閲覧可
  if (profile.role !== "admin" && lesson.teacher_id !== profile.id) {
    redirect("/dashboard");
  }

  // 出席は「日」単位で紐づくため、lesson_at の日付部分 (YYYY-MM-DD) を使用
  const lessonDateForAttendance = lesson.lesson_at ? lesson.lesson_at.slice(0, 10) : "";

  // この授業の担当生徒（teacher_id が一致）
  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("teacher_id", lesson.teacher_id)
    .order("name");

  // この日の出席データ
  const { data: attendances } = await supabase
    .from("attendances")
    .select("student_id, status, memo")
    .eq("lesson_date", lessonDateForAttendance)
    .in("student_id", (students ?? []).map((s) => s.id));

  const attendanceMap: Record<string, { status: string; memo: string | null }> = {};
  (attendances ?? []).forEach((a) => {
    attendanceMap[a.student_id] = { status: a.status, memo: a.memo };
  });

  const teacherRes = await supabase
    .from("profiles")
    .select("name")
    .eq("id", lesson.teacher_id)
    .single();
  const teacherName = teacherRes.data?.name ?? "担当";

  return (
    <div>
      <nav className="mb-3">
        <Link href="/dashboard" className="text-decoration-none small">
          ← ダッシュボードへ
        </Link>
      </nav>
      <h1 className="h3 mb-2">
        {lesson.lesson_at ? new Date(lesson.lesson_at).toLocaleString("ja-JP", { dateStyle: "long", timeStyle: "short" }) : ""} {lesson.title ? `— ${lesson.title}` : ""}
      </h1>
      <p className="text-muted small mb-4">担当: {teacherName}</p>

      <h2 className="h5 mb-3">出席・授業メモ</h2>
      <p className="small text-muted mb-3">
        各生徒の出欠とその日の様子をメモに記入してください。メモはAIフィードバックの生成に利用されます。
      </p>
      <LessonAttendanceForm
        lessonId={lesson.id}
        lessonDate={lessonDateForAttendance}
        students={students ?? []}
        initialAttendances={attendanceMap}
      />
    </div>
  );
}
