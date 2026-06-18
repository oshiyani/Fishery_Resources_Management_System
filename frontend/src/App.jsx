import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider          from "./context/AuthContext";
import Login                 from "./pages/Login";
import Dashboard             from "./pages/Dashboard";
import FishermanPage         from "./pages/fisherman/FishermanPage";
import VesselPage            from "./pages/vessel/VesselPage";
import LicensePage           from "./pages/license/LicensePage";
import CatchPage             from "./pages/catch/CatchPage";
import StockPage             from "./pages/stock/StockPage";
import ReportsPage           from "./pages/reports/ReportsPage";
import UserManagementPage    from "./pages/admin/UserManagementPage";
import ChangePasswordPage    from "./pages/ChangePasswordPage";

function AppRoutes() {
  const user = JSON.parse(localStorage.getItem('frms_user') || 'null');

  // If logged in and first login → force password change
  if (user && user.isFirstLogin &&
      window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <Routes>
      <Route path="/login"          element={<Login />} />
      <Route path="/change-password"element={user ? <ChangePasswordPage forced={user?.isFirstLogin} /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard"      element={user ? <Dashboard />             : <Navigate to="/login" replace />} />
      <Route path="/fishermen"      element={user ? <FishermanPage />         : <Navigate to="/login" replace />} />
      <Route path="/vessels"        element={user ? <VesselPage />            : <Navigate to="/login" replace />} />
      <Route path="/licenses"       element={user ? <LicensePage />           : <Navigate to="/login" replace />} />
      <Route path="/catches"        element={user ? <CatchPage />             : <Navigate to="/login" replace />} />
      <Route path="/stock"          element={user ? <StockPage />             : <Navigate to="/login" replace />} />
      <Route path="/reports"        element={user ? <ReportsPage />           : <Navigate to="/login" replace />} />
      <Route path="/users"          element={user?.role === 'admin' ? <UserManagementPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="*"               element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}