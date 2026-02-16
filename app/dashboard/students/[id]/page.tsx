// 層: ページ層 (ダッシュボード)
// 責務: 個々の生徒の出席・成績・AIフィードバックのハブ。attendances/grades を取得して表示し、成績記入欄を提供

import AttendanceList from "@/components/students/AttendanceList";
import GradeList from "@/components/students/GradeList";
import AddGradeForm from "@/components/students/AddGradeForm";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function StudentDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");

  const id = params?.id;
  if (!id) notFound();

  const supabase = createSupabaseServerClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, name, grade_level, teacher_id")
    .eq("id", id)
    .single();

  if (studentError || !student) notFound();

  // 担当生徒または管理者のみ閲覧可
  if (profile.role !== "admin" && student.teacher_id !== profile.id) {
    redirect("/dashboard/students");
  }

  const [attendancesRes, gradesRes, teacherRes] = await Promise.all([
    supabase
      .from("attendances")
      .select("id, lesson_date, status, memo")
      .eq("student_id", id)
      .order("lesson_date", { ascending: false }),
    supabase
      .from("grades")
      .select("id, test_name, score, max_score, comment, test_date")
      .eq("student_id", id)
      .order("test_date", { ascending: false }),
    student.teacher_id
      ? supabase.from("profiles").select("name").eq("id", student.teacher_id).single()
      : { data: null },
  ]);

  const attendances = attendancesRes.data ?? [];
  const grades = gradesRes.data ?? [];
  const teacherName = teacherRes.data?.name ?? null;

  return (
    <div>
      <nav className="mb-2">
        <Link href="/dashboard/students" className="text-decoration-none small">
          ← 生徒一覧
        </Link>
      </nav>
      <section className="mb-4">
        <h1 className="h3 mb-2">{student.name}</h1>
        <p className="text-muted mb-0 small">
          {student.grade_level && <span className="badge bg-secondary me-2">{student.grade_level}</span>}
          {teacherName && <span>担当: {teacherName}</span>}
        </p>
      </section>
      <div className="row g-4">
        <div className="col-md-6">
          <h2 className="h5 mb-3">出席履歴</h2>
          <AttendanceList studentId={id} attendances={attendances} />
        </div>
        <div className="col-md-6">
          <h2 className="h5 mb-3">成績履歴</h2>
          <GradeList studentId={id} grades={grades} />
          <div className="mt-3">
            <AddGradeForm studentId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
