import Link from "next/link";

// TODO: Supabase から取得するまでのダミー
const dummyStudents = [
  { id: "1", name: "山田 太郎", grade_level: "中3" },
  { id: "2", name: "佐藤 花子", grade_level: "高1" },
];

export default function StudentTable() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="px-4 py-2">氏名</th>
            <th className="px-4 py-2">学年</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {dummyStudents.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.grade_level}</td>
              <td className="px-4 py-2 text-right">
                <Link
                  href={`/dashboard/students/${s.id}`}
                  className="text-xs text-slate-900 underline"
                >
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

