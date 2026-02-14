// 層: レイアウト層 (ダッシュボードエリア専用)
// 責務: ログイン後ダッシュボード配下の共通ヘッダーとコンテンツ枠の提供

import type { ReactNode } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getCurrentProfile } from "@/lib/profile";
import { Container } from "react-bootstrap";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-vh-100 bg-light">
      <DashboardNavbar isAdmin={isAdmin} />
      <Container className="py-4">{children}</Container>
    </div>
  );
}
