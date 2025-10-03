import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import LeadDetailPage from "./LeadDetailPage";
import HomeDashboard from "./HomeDashboard";
import LeadsPage from "./Pages/LeadsPage";
import AutoLeadsSection from "./Pages/AutoLeadsSection";
import ManualLeadsSection from "./Pages/ManualLeadsSection";
import PerformancePage from "./PerformancePage";
import StatusPage from "./StatusPage";
import TitanAiCallAnalysis from "./TitanAiCallAnalysis";
import CallRecordingsPanel from "./components/CallRecordingsPanel";

// ✅ Import the new Leaderboard page
import LeaderboardPage from "./LeaderboardPage";

// ✅ Import the new Tasks page
import TasksPage from "./TasksPage";

// ✅ Import the new Monthly Challenge page
import ChallengePage from "./ChallengePage";

// ✅ Import PitchPal AI page
import PitchPalPage from "./PitchPalPage";

// ✅ Import Titan Brain page
import TitanBrainPage from "./TitanBrainPage";

// ✅ Import All Leads View page
import AllLeadsView from "./Pages/AllLeadsView";

export default function App() {
  const email = localStorage.getItem("email");
  const isAdmin = email === "pratham.goyalhariyana@gmail.com" || email === "avularudrasekharreddy@gmail.com";
  // "pratham.goyalhariyana@gmail.com";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            isAdmin ? <AdminDashboard user={{ email }} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/all-leads"
          element={
            isAdmin ? <AllLeadsView /> : <Navigate to="/" />
          }
        />
        <Route
          path="/leads/:email"
          element={isAdmin ? <LeadDetailPage /> : <Navigate to="/" />}
        />

        {/* ✅ Titan Brain (admin-only) */}
        <Route
          path="/admin/titan-brain"
          element={isAdmin ? <TitanBrainPage /> : <Navigate to="/" />}
        />

        {/* ✅ Call Recordings (admin-only) */}
        <Route
          path="/admin/recordings"
          element={isAdmin ? <CallRecordingsPanel /> : <Navigate to="/" />}
        />

        {/* Presales Redirect + Pages */}
        <Route
          path="/user"
          element={email ? <UserDashboard email={email} /> : <Navigate to="/" />}
        />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/pitchpal" element={<PitchPalPage />} />
        <Route path="/admin/ai-call-analysis" element={<TitanAiCallAnalysis />} />

        {/* Extra */}
        <Route path="/test-home" element={<HomeDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
