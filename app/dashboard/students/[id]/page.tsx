// 層: ページ層 (ダッシュボード)
// 責務: 個々の生徒に紐づく出席・成績・AIフィードバック操作のハブ画面

import AttendanceList from "@/components/students/AttendanceList";
import GradeList from "@/components/students/GradeList";
import FeedbackPanel from "@/components/students/FeedbackPanel";

interface Props {
  params: { id: string };
}

export default function StudentDetailPage({ params }: Props) {
  const { id } = params;
  // TODO: id を用いてサーバーコンポーネントで生徒情報を取得
  return (
    <div>
      <section className="mb-4">
        <h1 className="h3 mb-2">生徒詳細</h1>
        <p className="text-muted mb-0">
          生徒ID: <span className="badge bg-secondary">{id}</span>
        </p>
        {/* TODO: 生徒基本情報・担当教師情報を表示 */}
      </section>
      <div className="row g-4">
        <div className="col-md-6">
          <h2 className="h5 mb-3">出席履歴</h2>
          <AttendanceList studentId={id} />
        </div>
        <div className="col-md-6">
          <div className="mb-4">
            <h2 className="h5 mb-3">成績履歴</h2>
            <GradeList studentId={id} />
          </div>
          <div>
            <h2 className="h5 mb-3">AIフィードバック</h2>
            <FeedbackPanel studentId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

