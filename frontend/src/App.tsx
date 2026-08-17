import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Leave } from "./pages/Leave";
import { Loan } from "./pages/Loan";
import { Payslip } from "./pages/Payslip";
import { Approvals } from "./pages/Approvals";

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function ReviewerRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || (user.role !== "MANAGER" && user.role !== "HR_ADMIN")) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/loan" element={<Loan />} />
        <Route path="/payslip" element={<Payslip />} />
        <Route
          path="/approvals"
          element={
            <ReviewerRoute>
              <Approvals />
            </ReviewerRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
