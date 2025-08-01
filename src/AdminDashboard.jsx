// ✅ unchanged imports
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ project: "", member: "", dateRange: "" });
  const [teamStats, setTeamStats] = useState([]);
  const [bookingTrend, setBookingTrend] = useState([]);
  const [qualityDistribution, setQualityDistribution] = useState([]);
  const [teamStatus, setTeamStatus] = useState([]);
  const [showBar, setShowBar] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showPie, setShowPie] = useState(false);
  const scriptId = "AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA";
  const pieColors = ["#ef4444", "#facc15", "#3b82f6"];
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [autoLeadsCount, setAutoLeadsCount] = useState(0);
  const [manualLeadsCount, setManualLeadsCount] = useState(0);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
  const [siteVisitsCount, setSiteVisitsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [conversionPercent, setConversionPercent] = useState("0.0");

  // Dynamically get columns from teamStats for the leaderboard table
  const teamStatsColumns = teamStats.length > 0
    ? Object.keys(teamStats[0]).filter(key => key !== 'name')
    : [];

  // Defensive fallback for all expected fields
  function getStat(member, key) {
    return (
      member[key] ??
      member[key.charAt(0).toUpperCase() + key.slice(1)] ??
      0
    );
  }

  // Sort leaderboard by score descending (default 0)
  const sortedTeamStats = [...teamStats].sort((a, b) => (getStat(b, 'score')) - (getStat(a, 'score')));

  // Calculate quality counts for each member (frontend fallback)
  const teamStatsWithQuality = sortedTeamStats.map(member => {
    const wip = getStat(member, 'wip');
    const warm = getStat(member, 'warm');
    const cold = getStat(member, 'cold');
    return { ...member, wip, warm, cold };
  });
  

  // Note: Cross-Origin-Opener-Policy warnings in the browser console are unrelated to this dashboard logic and can be ignored unless you are using window.open or window.postMessage between different origins.
  const handleFilterChange = (key, value) => {
    // Normalize project names for backend API calls
    if (key === "project" && value) {
      const normalizedValue = value.toLowerCase().trim();
      setFilters(prev => ({ ...prev, [key]: normalizedValue }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  // Get all unique projects from teamStats data
  const allProjects = [...new Set(teamStats.map(stat => stat.project).filter(Boolean))];
  
  // Define main project list (normalized to lowercase for comparison)
  const mainProjects = [
    'orchid life',
    'orchid salisbury', 
    'orchid bloomsberry',
    'orchid platinum',
    'riviera uno'
  ];
  
  // Check if there are projects outside the main list
  const hasOtherProjects = allProjects.some(project => 
    !mainProjects.includes((project || '').toLowerCase().trim())
  );

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLeadsLoading(true);
      const params = new URLSearchParams({
        action: "getAdminStats",
        project: filters.project,
        member: filters.member,
        dateRange: filters.dateRange,
      });
      try {
        const res = await fetch(`https://script.google.com/macros/s/${scriptId}/exec?${params}`);
        const data = await res.json();
        setTeamStats(data.teamStats || []);
        setBookingTrend(data.bookingTrend || []);
        setQualityDistribution(data.qualityDistribution || []);
        setAutoLeadsCount(data.autoLeadsCount || 0);
        setManualLeadsCount(data.manualLeadsCount || 0);
        setTotalLeadsCount(data.totalLeadsCount || 0);
        // Try to use backend-provided siteVisitsCount/bookingsCount/conversionPercent if available
        if (typeof data.siteVisitsCount === 'number') setSiteVisitsCount(data.siteVisitsCount);
        else setSiteVisitsCount((data.teamStats || []).reduce((sum, t) => sum + (t.siteVisits || 0), 0));
        if (typeof data.bookingsCount === 'number') setBookingsCount(data.bookingsCount);
        else setBookingsCount((data.teamStats || []).reduce((sum, t) => sum + (t.bookings || 0), 0));
        if (typeof data.conversionPercent === 'string' || typeof data.conversionPercent === 'number') setConversionPercent(data.conversionPercent.toString());
        else {
          const totalLeads = (data.autoLeadsCount || 0) + (data.manualLeadsCount || 0);
          const junkLeads = (data.autoJunk || 0) + (data.manualJunk || 0);
          const effectiveLeads = totalLeads - junkLeads;
        
          const bookings = typeof data.bookingsCount === 'number'
            ? data.bookingsCount
            : (data.teamStats || []).reduce((sum, t) => sum + (t.bookings || 0), 0);
        
          const percent = effectiveLeads > 0
            ? ((bookings / effectiveLeads) * 100).toFixed(1)
            : "0.0";
        
          setConversionPercent(percent);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLeadsLoading(false);
      }
    };
    fetchAdminStats();
  }, [filters]);

  useEffect(() => {
    const fetchTeamStatus = async () => {
      try {
        const res = await fetch(`https://script.google.com/macros/s/${scriptId}/exec?action=getTeamStatus`);
        const data = await res.json();
        setTeamStatus(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching team status:", err);
        setTeamStatus([]);
      }
    };
    fetchTeamStatus();
  }, []);

  const toggleStatus = async (email, index) => {
    const current = teamStatus[index].Status;
    const newStatus = current === "Active" ? "Leave" : "Active";
    try {
      await fetch(`https://script.google.com/macros/s/${scriptId}/exec?action=updateTeamStatus&email=${email}&status=${newStatus}`);
      const updated = [...teamStatus];
      updated[index].Status = newStatus;
      setTeamStatus(updated);
    } catch (err) {
      console.error("Failed to update team status", err);
    }
  };
  const exportLeaderboardToExcel = () => {
    const data = teamStatsWithQuality.map(member => ({
      Name: member.name || "-",
      "Leads": (getStat(member, 'autoLeads') || getStat(member, 'auto') || 0) +
               (getStat(member, 'manualLeads') || getStat(member, 'manual') || 0),
      "Auto Leads": getStat(member, 'autoLeads') || getStat(member, 'auto') || 0,
      "Manual Leads": getStat(member, 'manualLeads') || getStat(member, 'manual') || 0,
      "Site Visits": getStat(member, 'siteVisits'),
      "Bookings": getStat(member, 'bookings'),
      "WIP (Auto)": getStat(member, 'autoWIP'),
      "WIP (Manual)": getStat(member, 'manualWIP'),
      "Warm (Auto)": getStat(member, 'autoWarm'),
      "Warm (Manual)": getStat(member, 'manualWarm'),
      "Cold (Auto)": getStat(member, 'autoCold'),
      "Cold (Manual)": getStat(member, 'manualCold'),
      "Junk (Auto)": getStat(member, 'autoJunk'),
      "Junk (Manual)": getStat(member, 'manualJunk'),
      "Invalid (Auto)": getStat(member, 'autoInvalid'),
      "Invalid (Manual)": getStat(member, 'manualInvalid'),
      "Score": getStat(member, 'score')
    }));
  
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
  
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "TeamLeaderboard.xlsx");
  };
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h2>
      <ProjectInfoEditor />
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select onChange={e => handleFilterChange("project", e.target.value)} className="p-2 border rounded w-48">
          <option value="">All Projects</option>
          {allProjects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
          {hasOtherProjects && <option value="Other">Other Projects</option>}
        </select>
        <select onChange={e => handleFilterChange("member", e.target.value)} className="p-2 border rounded w-48">
          <option value="">All Members</option>
          {teamStats.map(t => <option key={t.name}>{t.name}</option>)}
        </select>
        <select onChange={e => handleFilterChange("dateRange", e.target.value)} className="p-2 border rounded w-48">
          <option value="">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <SummaryCard
          title="Auto Leads"
          value={leadsLoading ? "..." : teamStats.reduce((sum, t) => sum + (t.autoLeads?? 0), 0)}
          color="bg-blue-400"
        />
        <SummaryCard title="Manual Leads" value={leadsLoading ? "..." : manualLeadsCount} color="bg-blue-600" />
        <SummaryCard title="Total Leads" value={leadsLoading ? "..." : totalLeadsCount} color="bg-blue-800" />
        <SummaryCard 
  title="Junk Leads" 
  value={leadsLoading ? "..." : teamStats.reduce((sum, t) => sum + (t.autoJunk || t.manualJunk || 0), 0)} 
  color="bg-red-600" 
/>
        <SummaryCard title="Site Visits" value={leadsLoading ? "..." : siteVisitsCount} color="bg-green-500" />
        <SummaryCard title="Bookings" value={leadsLoading ? "..." : bookingsCount} color="bg-purple-500" />
        <SummaryCard title="Conversion %" value={leadsLoading ? "..." : conversionPercent + "%"} color="bg-yellow-500" />
        <SummaryCard title="Manual WIP" value={leadsLoading ? "..." : teamStats.reduce((sum, t) => sum + (t.manualWIP || 0), 0)} color="bg-red-400" />
<SummaryCard title="Manual Warm" value={leadsLoading ? "..." : teamStats.reduce((sum, t) => sum + (t.manualWarm || 0), 0)} color="bg-yellow-300" />
<SummaryCard title="Manual Cold" value={leadsLoading ? "..." : teamStats.reduce((sum, t) => sum + (t.manualCold || 0), 0)} color="bg-blue-400" />
<SummaryCard title="Manual Invalid" value={leadsLoading ? "..." : teamStats.reduce((sum, t) => sum + (t.manualInvalid || 0), 0)} color="bg-blue-400" />

      </div>

      {/* Leaderboard Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Team Leaderboard</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2">Leads</th>
              <th className="p-2">Auto Leads</th>
              <th className="p-2">Manual Leads</th>
              <th className="p-2">Site Visits</th>
              <th className="p-2">Bookings</th>
              <th className="p-2">WIP (Auto)</th>
              <th className="p-2">WIP (Manual)</th>
              <th className="p-2">Warm (Auto)</th>
              <th className="p-2">Warm (Manual)</th>
              <th className="p-2">Cold (Auto)</th>
              <th className="p-2">Cold (Manual)</th>
              <th className="p-2">Junk (Auto)</th>
              <th className="p-2">Junk (Manual)</th>
              <th className="p-2">Invalid (Auto)</th>
              <th className="p-2">Invalid (Manual)</th>

              <th className="p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {teamStatsWithQuality.map((t, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-2">{t.name || '-'}</td>
                <td className="p-2 text-center">
  {(getStat(t, 'autoLeads') || getStat(t, 'auto') || 0) + (getStat(t, 'manualLeads') || getStat(t, 'manual') || 0)}
</td>
<td className="p-2 text-center">{getStat(t, 'autoLeads') || getStat(t, 'auto') || 0}</td>
<td className="p-2 text-center">{getStat(t, 'manualLeads') || getStat(t, 'manual') || 0}</td>
                <td className="p-2 text-center">{getStat(t, 'siteVisits')}</td>
                <td className="p-2 text-center">{getStat(t, 'bookings')}</td>
                <td className="p-2 text-center">{getStat(t, 'autoWIP')}</td>
                <td className="p-2 text-center">{getStat(t, 'manualWIP')}</td>
                <td className="p-2 text-center">{getStat(t, 'autoWarm')}</td>
                <td className="p-2 text-center">{getStat(t, 'manualWarm')}</td>
                <td className="p-2 text-center">{getStat(t, 'autoCold')}</td>
                <td className="p-2 text-center">{getStat(t, 'manualCold')}</td>
                <td className="p-2 text-center">{getStat(t, 'autoJunk')}</td>
                <td className="p-2 text-center">{getStat(t, 'manualJunk')}</td>
                <td className="p-2 text-center">{getStat(t, 'autoInvalid')}</td>
                <td className="p-2 text-center">{getStat(t, 'manualInvalid')}</td>
                <td className="p-2 text-center">{getStat(t, 'score')}</td>
              </tr>
              
            ))}
            {/* Summary row */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2 text-right">Total</td>
              <td className="p-2 text-center">
  {teamStatsWithQuality.reduce((sum, t) =>
    sum + (getStat(t, 'autoLeads') || getStat(t, 'auto') || 0) +
          (getStat(t, 'manualLeads') || getStat(t, 'manual') || 0), 0)}
</td>
<td className="p-2 text-center">
  {teamStatsWithQuality.reduce((sum, t) => sum + (getStat(t, 'autoLeads') || getStat(t, 'auto') || 0), 0)}
</td>
<td className="p-2 text-center">
  {teamStatsWithQuality.reduce((sum, t) => sum + (getStat(t, 'manualLeads') || getStat(t, 'manual') || 0), 0)}
</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'siteVisits'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'bookings'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'autoWIP'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'manualWIP'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'autoWarm'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'manualWarm'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'autoCold'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'manualCold'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'autoJunk'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'manualJunk'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'autoInvalid'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'manualInvalid'), 0)}</td>
              <td className="p-2 text-center">{teamStatsWithQuality.reduce((sum, t) => sum + getStat(t, 'score'), 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mb-4">
  
  <button
    onClick={exportLeaderboardToExcel}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    📥 Download Excel
  </button>
</div>

      {/* Chart Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10 mb-6">
        <ChartCard title="📊 Leads vs Bookings" toggle={showBar} setToggle={setShowBar} />
        <ChartCard title="📈 Bookings Over Time" toggle={showLine} setToggle={setShowLine} />
        <ChartCard title="🧩 Lead Quality Breakdown" toggle={showPie} setToggle={setShowPie} />
        <ChartCard title="🧠 Titan Brain – AI Corrections" toggle={false} setToggle={() => navigate("/admin/titan-brain")} />
        <ChartCard title="📞 Call Recording & Analysis" toggle={false} setToggle={() => navigate("/admin/recordings")} />
        {/* <ChartCard title="🧠 Titan AI Call Analysis" toggle={false} setToggle={() => window.open("https://famous-wasps-help.loca.lt/admin/ai-call-analysis", "_blank")} /> */}
      </div>

      {/* Charts */}
      {showBar && (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#60a5fa" name="Leads" />
              <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {showLine && (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {showPie && (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={qualityDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                {qualityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className={`p-4 text-white rounded-xl shadow ${color}`}>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ChartCard({ title, toggle, setToggle }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-50" onClick={() => setToggle && setToggle(!toggle)}>
      <h4 className="font-semibold text-lg mb-1">{title}</h4>
      <p className="text-sm text-gray-600">Click to {toggle ? "hide" : "view"}</p>
    </div>
  );
}

function ChartWrapper({ children }) {
  return <div className="bg-white p-4 rounded-xl shadow mb-6">{children}</div>;
}

function ProjectInfoEditor() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectInfo, setProjectInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [newProject, setNewProject] = useState({ name: "", info: {} });
  const [corrections, setCorrections] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const adminEmails = ["pratham.goyalhariyana@gmail.com", "avularudrasekharreddy@gmail.com"];
  const userEmail = localStorage.getItem("email") || "";
  const isAdmin = adminEmails.includes(userEmail);

  // Add a new state for the textarea value
  const [projectInfoInput, setProjectInfoInput] = useState("");

  // Fetch all projects from Firestore
  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      setProjects(snapshot.docs.map(doc => doc.id));
      console.log('Fetched projects:', snapshot.docs.map(doc => doc.id));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError("Failed to fetch projects: " + err.message);
    }
    setLoading(false);
  };

  // Fetch selected project info
  const fetchProjectInfo = async (projectName) => {
    setLoading(true);
    setError("");
    try {
      const docRef = doc(db, 'projects', projectName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProjectInfo(docSnap.data());
        console.log('Fetched project info for:', projectName, docSnap.data());
      } else {
        setProjectInfo({});
        console.log('No project info found for:', projectName);
      }
    } catch (err) {
      console.error('Error fetching project info:', err);
      setError("Failed to fetch project info: " + err.message);
    }
    setLoading(false);
  };

  // Fetch corrections for selected project
  const fetchCorrections = async (projectName) => {
    if (!projectName) return;
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, 'projects', projectName, 'corrections'));
      setCorrections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('Fetched corrections for:', projectName, snapshot.docs.length);
    } catch (err) {
      console.error('Error fetching corrections:', err);
      setError("Failed to fetch corrections: " + err.message);
    }
    setLoading(false);
  };

  // When a project is selected, set the input value to the stringified projectInfo or empty string
  useEffect(() => {
    if (typeof projectInfo === 'object' && Object.keys(projectInfo).length > 0) {
      setProjectInfoInput(JSON.stringify(projectInfo, null, 2));
    } else if (typeof projectInfo === 'string') {
      setProjectInfoInput(projectInfo);
    } else {
      setProjectInfoInput("");
    }
  }, [projectInfo, selectedProject]);

  // Save project info to Firestore
  const saveProjectInfo = async () => {
    setError(""); 
    setSuccess("");
    setLoading(true);
    
    if (projectInfoInput.trim() === "") {
      setError("Project info cannot be empty.");
      setLoading(false);
      return;
    }
    
    let infoToSave;
    try {
      // Try to parse as JSON first
      infoToSave = JSON.parse(projectInfoInput);
    } catch (jsonErr) {
      // If not valid JSON, treat as plain text
      infoToSave = { notes: projectInfoInput.trim() };
    }
    
    try {
      await setDoc(doc(db, 'projects', selectedProject), infoToSave, { merge: true });
      setSuccess("✅ Project info updated successfully!");
      setTimeout(() => { 
        setSuccess(""); 
        fetchProjects(); 
      }, 2000);
    } catch (err) {
      setError("Failed to save project info: " + err.message);
    }
    setLoading(false);
  };

  // Create new project
  const createNewProject = async () => {
    setError(""); 
    setSuccess("");
    
    if (!newProject.name.trim()) { 
      setError("Project name is required"); 
      return; 
    }
    
    setLoading(true);
    try {
      let infoToSave = newProject.info;
      if (typeof newProject.info === 'string' && newProject.info.trim()) {
        try {
          infoToSave = JSON.parse(newProject.info);
        } catch {
          infoToSave = { notes: newProject.info.trim() };
        }
      }
      
      await setDoc(doc(db, 'projects', newProject.name.trim()), infoToSave);
      setSuccess("✅ Project created successfully!");
      setShowNewProject(false);
      setNewProject({ name: "", info: {} });
      fetchProjects();
    } catch (err) {
      setError("Failed to create project: " + err.message);
    }
    setLoading(false);
  };

  // Delete/resolve a correction
  const deleteCorrection = async (correctionId) => {
    setError(""); 
    setSuccess("");
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'projects', selectedProject, 'corrections', correctionId));
      setCorrections(corrections.filter(c => c.id !== correctionId));
      setSuccess("✅ Correction resolved/deleted");
      setTimeout(() => { setSuccess(""); }, 2000);
    } catch (err) {
      setError("Failed to delete correction: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { 
    if (selectedProject) { 
      fetchProjectInfo(selectedProject); 
      fetchCorrections(selectedProject); 
    } 
  }, [selectedProject]);

  if (!isAdmin) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h3 className="text-lg font-bold mb-4 text-blue-800">🛠️ Update Project Info</h3>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{error}</div>}
      {success && <div className="text-green-600 mb-2 p-2 bg-green-50 rounded">{success}</div>}
      
      <div className="mb-4 flex gap-4 items-center">
        <select 
          value={selectedProject} 
          onChange={e => setSelectedProject(e.target.value)} 
          className="border p-2 rounded"
          disabled={loading}
        >
          <option value="">Select Project</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button 
          onClick={() => setShowNewProject(!showNewProject)} 
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          disabled={loading}
        >
          {showNewProject ? "Cancel" : "Create New Project"}
        </button>
      </div>
      
      {showNewProject && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <input 
            className="border p-2 rounded w-full mb-2" 
            placeholder="Project Name" 
            value={newProject.name} 
            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
          />
          <textarea 
            className="border p-2 rounded w-full mb-2" 
            placeholder="Project Info (JSON or plain text)" 
            value={typeof newProject.info === 'object' ? JSON.stringify(newProject.info, null, 2) : (newProject.info || '')} 
            onChange={e => {
              setNewProject({ ...newProject, info: e.target.value });
              setError("");
            }}
            rows={4}
          />
          <button 
            onClick={createNewProject} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Save Project"}
          </button>
        </div>
      )}
      
      {selectedProject && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Info (JSON or plain text)
            </label>
            <textarea
              className="border p-2 rounded w-full mb-2"
              placeholder="Enter project info as JSON or plain text..."
              value={projectInfoInput}
              onChange={e => {
                setProjectInfoInput(e.target.value);
                setError("");
              }}
              rows={6}
            />
            <div className="text-sm text-gray-600 mb-2">
              💡 Tip: You can enter JSON format or plain text. Plain text will be saved as {"{notes: 'your text'}"}.
            </div>
          </div>
          
          <button
            onClick={saveProjectInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
            disabled={loading || projectInfoInput.trim() === ""}
          >
            {loading ? "Saving..." : "Save Info"}
          </button>
        </div>
      )}
      
      {/* Corrections Section */}
      {selectedProject && corrections.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold text-blue-700 mb-2">Corrections/Flags for this Project</h4>
          <div className="space-y-2">
            {corrections.map(c => (
              <div key={c.id} className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-red-800">Field: {c.field}</div>
                    <div className="text-sm text-red-700">Rejected: {c.rejectedItem}</div>
                    <div className="text-sm text-gray-600">Reason: {c.reason}</div>
                    <div className="text-xs text-gray-500">By: {c.flaggedBy} on {new Date(c.timestamp).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => deleteCorrection(c.id)}
                    className="text-red-600 hover:text-red-800 text-sm underline ml-2"
                    disabled={loading}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
