import StudentTable from "@/components/students/StudentTable";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">生徒一覧</h1>
      <StudentTable />
    </div>
  );
}

