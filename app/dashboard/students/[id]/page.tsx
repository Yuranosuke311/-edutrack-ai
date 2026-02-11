import AttendanceList from "@/components/students/AttendanceList";
import GradeList from "@/components/students/GradeList";

interface Props {
  params: { id: string };
}

export default function StudentDetailPage({ params }: Props) {
  const { id } = params;
  // TODO: id を用いてサーバーコンポーネントで生徒情報を取得
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold">生徒詳細</h1>
        <p className="mt-2 text-sm text-slate-600">生徒ID: {id}</p>
        {/* TODO: 生徒基本情報・担当教師情報を表示 */}
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold">出席履歴</h2>
          <AttendanceList studentId={id} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold">成績履歴</h2>
          <GradeList studentId={id} />
        </div>
      </section>
    </div>
  );
}

