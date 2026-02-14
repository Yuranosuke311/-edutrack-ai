// 層: コンポーネント層 (ナビゲーション)
// 責務: ダッシュボード用のナビゲーションバー

"use client";

import { Navbar, Nav, Container } from "react-bootstrap";
import LogoutButton from "@/components/LogoutButton";

interface Props {
  isAdmin: boolean;
}

export default function DashboardNavbar({ isAdmin }: Props) {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand href="/dashboard" className="fw-bold">
          EduTrack AI
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="/dashboard">ダッシュボード</Nav.Link>
            <Nav.Link href="/dashboard/students">生徒一覧</Nav.Link>
            {isAdmin && (
              <Nav.Link href="/dashboard/admin">管理者メニュー</Nav.Link>
            )}
            <div className="ms-3">
              <LogoutButton />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
