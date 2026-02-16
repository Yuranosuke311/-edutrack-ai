// 層: コンポーネント層 (ダッシュボード)
// 責務: 月別カレンダーで授業を表示（教師=担当のみ・管理者=全件）

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  lesson_at: string;
  teacher_id: string;
  title: string | null;
  created_at: string;
}

export default function CalendarView() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lessons?month=${month}`)
      .then((r) => (r.ok ? r.json() : { lessons: [] }))
      .then((d) => {
        setLessons(d.lessons ?? []);
      })
      .finally(() => setLoading(false));
  }, [month]);

  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const totalCells = startPad + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  const lessonsByDate: Record<string, Lesson[]> = {};
  lessons.forEach((l) => {
    const dateKey = l.lesson_at ? l.lesson_at.slice(0, 10) : "";
    if (!dateKey) return;
    if (!lessonsByDate[dateKey]) lessonsByDate[dateKey] = [];
    lessonsByDate[dateKey].push(l);
  });

  function prevMonth() {
    const d = new Date(y, m - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  function nextMonth() {
    const d = new Date(y, m, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h6 mb-0">授業カレンダー</h2>
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={prevMonth}>
            ‹ 前月
          </button>
          <span className="text-nowrap">{y}年{m}月</span>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={nextMonth}>
            翌月 ›
          </button>
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <p className="text-muted small p-3">読み込み中...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered mb-0 calendar-table">
              <thead>
                <tr>
                  {weekDays.map((w) => (
                    <th key={w} className="text-center small">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 7 }).map((_, colIndex) => {
                      const cellIndex = rowIndex * 7 + colIndex;
                      const dayNum = cellIndex - startPad + 1;
                      const isInMonth = dayNum >= 1 && dayNum <= daysInMonth;
                      const dateStr = isInMonth
                        ? `${y}-${String(m).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                        : "";
                      const dayLessons = dateStr ? lessonsByDate[dateStr] ?? [] : [];
                      return (
                        <td
                          key={colIndex}
                          className="p-1 align-top"
                          style={{ minHeight: "80px", verticalAlign: "top" }}
                        >
                          <span className="small text-muted">{isInMonth ? dayNum : ""}</span>
                          <div className="d-flex flex-column gap-1 mt-1">
                            {dayLessons.map((l) => (
                              <Link
                                key={l.id}
                                href={`/dashboard/lessons/${l.id}`}
                                className="btn btn-sm btn-outline-primary text-start text-truncate"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {l.title || "授業"}
                              </Link>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
