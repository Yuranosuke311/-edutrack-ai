// 層: lib層 (定数定義)
// 責務: 画面やAPIで共有するロール名・ステータスなどの定数を一元管理

export const ROLES = {
  TEACHER: "teacher",
  ADMIN: "admin",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
} as const;

