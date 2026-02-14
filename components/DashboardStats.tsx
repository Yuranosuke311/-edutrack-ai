// 層: コンポーネント層 (ダッシュボードUI)
// 責務: Supabaseから取得した統計情報をカード形式で表示

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";
import type { Role } from "@/types";

interface Props {
  role: Role;
}

export default async function DashboardStats({ role }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = createSupabaseServerClient();
  const isAdmin = role === "admin";

  // 教師の場合は自分の担当生徒のみ、管理者の場合は全生徒
  let studentsQuery = supabase.from("students").select("id", { count: "exact" });
  if (!isAdmin) {
    studentsQuery = studentsQuery.eq("teacher_id", profile.id);
  }
  const { count: studentCount } = await studentsQuery;

  // 教師数の取得（管理者のみ）
  let teacherCount: number | null = null;
  if (isAdmin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .eq("role", "teacher");
    teacherCount = count;
  }

  // 今月の授業数（教師の場合は自分の担当生徒のみ）
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let attendancesQuery = supabase
    .from("attendances")
    .select("id", { count: "exact" })
    .gte("lesson_date", startOfMonth.toISOString().split("T")[0]);
  
  if (!isAdmin) {
    // 教師の場合は自分の担当生徒の出席のみ
    const { data: myStudents } = await supabase
      .from("students")
      .select("id")
      .eq("teacher_id", profile.id);
    
    if (myStudents && myStudents.length > 0) {
      const studentIds = myStudents.map((s) => s.id);
      attendancesQuery = attendancesQuery.in("student_id", studentIds);
    } else {
      // 担当生徒がいない場合は0
      attendancesQuery = supabase
        .from("attendances")
        .select("id", { count: "exact" })
        .eq("id", "00000000-0000-0000-0000-000000000000"); // 存在しないIDで0件にする
    }
  }
  
  const { count: lessonCount } = await attendancesQuery;

  // 平均点の計算（教師の場合は自分の担当生徒のみ）
  let gradesQuery = supabase.from("grades").select("score, max_score");
  if (!isAdmin) {
    const { data: myStudents } = await supabase
      .from("students")
      .select("id")
      .eq("teacher_id", profile.id);
    
    if (myStudents && myStudents.length > 0) {
      const studentIds = myStudents.map((s) => s.id);
      gradesQuery = gradesQuery.in("student_id", studentIds);
    } else {
      gradesQuery = supabase
        .from("grades")
        .select("score, max_score")
        .eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }
  
  const { data: grades } = await gradesQuery;
  let averageScore: string = "-";
  if (grades && grades.length > 0) {
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const totalMax = grades.reduce((sum, g) => sum + g.max_score, 0);
    if (totalMax > 0) {
      const avg = (totalScore / totalMax) * 100;
      averageScore = `${avg.toFixed(1)}%`;
    }
  }

  return (
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <p className="text-muted small mb-2">今月の授業数</p>
            <h2 className="display-6 fw-bold">{lessonCount ?? 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <p className="text-muted small mb-2">平均点</p>
            <h2 className="display-6 fw-bold">{averageScore}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <p className="text-muted small mb-2">
              {isAdmin ? "生徒数 / 教師数" : "担当生徒数"}
            </p>
            <h2 className="display-6 fw-bold">
              {isAdmin
                ? `${studentCount ?? 0} / ${teacherCount ?? 0}`
                : studentCount ?? 0}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

