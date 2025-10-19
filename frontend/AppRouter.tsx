import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { SquadsPage } from "./pages/SquadsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { LeavePage } from "./pages/LeavePage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditPage } from "./pages/AuditPage";

const PUBLISHABLE_KEY = "pk_test_Y2l2aWwtY3Jhd2RhZC0zLmNsZXJrLmFjY291bnRzLmRldiQ";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="squads" element={<SquadsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  );
}
