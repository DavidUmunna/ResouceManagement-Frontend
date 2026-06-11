import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import AppLayout   from "./components/AppLayout";
import RoleGuard   from "./components/RoleGuard";
import { ROUTE_ROLES as R } from "./constants/roles";

// Eagerly loaded — small or always-needed pages
import CreateOrder         from "./pages/CreateOrder";
import Users               from "./pages/User_list";
import { Dashboard }       from "./pages/Dash/Dashboard";
import SupplierList        from "./pages/Suppliers/supplierList";
import UserTasks           from "./pages/Usertask";
import OrdersDashboard     from "./pages/orders management/Ordersmanagement";
import InventoryLogs       from "./pages/inventorymanagement/inventory_logs/index";
import ScheduleEditor      from "./pages/SchedulingComponents/ScheduleEditor";
import FileTracking        from "./pages/FileTracking";
import AiToolsPage         from "./pages/AI-tools/AiToolsPage";
import TendersPage         from "./pages/Tenders";
import LeavePage           from "./pages/Leave";
import AdminLeavePanel     from "./pages/Leave/AdminLeavePanel";
import LeaveSummaryPage    from "./pages/Leave/LeaveSummaryPage";
import POAnalyticsPage     from "./pages/POAnalytics";

// Lazily loaded — heavier pages kept out of the initial bundle
const DepartmentAssignment = React.lazy(() => import("./pages/Department_assignment"));
const InventoryManagement  = React.lazy(() => import("./pages/inventorymanagement/ParentComp"));
const SkipsManagement      = React.lazy(() => import("./pages/skips/parent"));
const Monitoring           = React.lazy(() => import("./pages/Monitoring"));
const AssetsManagement     = React.lazy(() => import("./pages/AssetManagement/Assetmanagement"));
const ScheduleManager      = React.lazy(() => import("./pages/SchedulingComponents/ScheduleManager"));
const DraftSchedules       = React.lazy(() => import("./pages/SchedulingComponents/ScheduleManager/DraftSchedules"));
const FeedbackPage         = React.lazy(() => import("./pages/Feedback"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm animate-pulse">
      Loading…
    </div>
  );
}

// Thin wrapper so route JSX stays readable
function Guard({ route, children }) {
  const allowed = R[route];
  return allowed ? <RoleGuard allowed={allowed}>{children}</RoleGuard> : children;
}

export default function ProtectedLayout({ isauthenticated, setisauthenticated }) {
  const [dashboardIsLoading, setDashboardIsLoading] = React.useState(false);

  if (!isauthenticated) {
    return <Navigate to="/adminlogin" replace />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="admin" element={<AppLayout isLoading={dashboardIsLoading} />}>

          {/* Unrestricted — every authenticated user */}
          <Route path="dashboard"  element={<Dashboard setLayoutLoading={setDashboardIsLoading} />} />
          <Route path="leave"      element={<LeavePage />} />
          <Route path="feedback"   element={<FeedbackPage />} />
          <Route path="usertasks"  element={<UserTasks />} />
          <Route path="users"      element={<Users />} />
          <Route path="createorder" element={<CreateOrder />} />
          <Route path="schedules"           element={<DraftSchedules />} />
          <Route path="schedules/:id/edit"  element={<ScheduleEditor />} />
          <Route path="schedulemanager"     element={<ScheduleManager />} />
          <Route path="requestlist"         element={<OrdersDashboard setAuth={setisauthenticated} />} />

          {/* Role-restricted routes — redirect to /admin/dashboard if not authorised */}
          <Route path="leave-admin"   element={<Guard route="leave-admin"><AdminLeavePanel /></Guard>} />
          <Route path="leave-summary" element={<Guard route="leave-summary"><LeaveSummaryPage /></Guard>} />
          <Route path="po-analytics"  element={<Guard route="po-analytics"><POAnalyticsPage /></Guard>} />

          <Route path="assetsmanagement"     element={<Guard route="assetsmanagement"><AssetsManagement setAuth={setisauthenticated} /></Guard>} />
          <Route path="supplierlist"         element={<Guard route="supplierlist"><SupplierList /></Guard>} />
          <Route path="inventorymanagement"  element={<Guard route="inventorymanagement"><InventoryManagement /></Guard>} />
          <Route path="inventorylogs"        element={<Guard route="inventorylogs"><InventoryLogs /></Guard>} />
          <Route path="tenders"              element={<Guard route="tenders"><TendersPage /></Guard>} />
          <Route path="filetracking"         element={<Guard route="filetracking"><FileTracking /></Guard>} />
          <Route path="ai-tools"             element={<Guard route="ai-tools"><AiToolsPage /></Guard>} />
          <Route path="departmentassignment" element={<Guard route="departmentassignment"><DepartmentAssignment setAuth={setisauthenticated} /></Guard>} />
          <Route path="skipstracking"        element={<Guard route="skipstracking"><SkipsManagement /></Guard>} />
          <Route path="monitoring"           element={<Guard route="monitoring"><Monitoring /></Guard>} />

          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />

        </Route>
      </Routes>
    </Suspense>
  );
}
