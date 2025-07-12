// ✅ unchanged imports
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import { db } from '../../firebase-config.js';
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
          const total = (data.autoLeadsCount || 0) + (data.manualLeadsCount || 0);
          const bookings = (typeof data.bookingsCount === 'number') ? data.bookingsCount : (data.teamStats || []).reduce((sum, t) => sum + (t.bookings || 0), 0);
          setConversionPercent(total > 0 ? ((bookings / total) * 100).toFixed(1) : "0.0");
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard title="Auto Leads" value={leadsLoading ? "..." : autoLeadsCount} color="bg-blue-400" />
        <SummaryCard title="Manual Leads" value={leadsLoading ? "..." : manualLeadsCount} color="bg-blue-600" />
        <SummaryCard title="Total Leads" value={leadsLoading ? "..." : totalLeadsCount} color="bg-blue-800" />
        <SummaryCard title="Site Visits" value={leadsLoading ? "..." : siteVisitsCount} color="bg-green-500" />
        <SummaryCard title="Bookings" value={leadsLoading ? "..." : bookingsCount} color="bg-purple-500" />
        <SummaryCard title="Conversion %" value={leadsLoading ? "..." : conversionPercent + "%"} color="bg-yellow-500" />
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
              <th className="p-2">Called</th>
              <th className="p-2">Site Visits</th>
              <th className="p-2">Bookings</th>
              <th className="p-2">Call Delays</th>
              <th className="p-2">Conversion %</th>
              <th className="p-2">WIP (Auto)</th>
              <th className="p-2">WIP (Manual)</th>
              <th className="p-2">Warm (Auto)</th>
              <th className="p-2">Warm (Manual)</th>
              <th className="p-2">Cold (Auto)</th>
              <th className="p-2">Cold (Manual)</th>
            </tr>
          </thead>
          <tbody>
            {teamStats.map((t, i) => {
              const conversion = t.bookings && t.leads ? ((t.bookings / t.leads) * 100).toFixed(1) + "%" : "0%";
              return (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2 text-center">{t.leads}</td>
                  <td className="p-2 text-center">{t.autoLeads || 0}</td>
                  <td className="p-2 text-center">{t.manualLeads || 0}</td>
                  <td className="p-2 text-center">{t.called}</td>
                  <td className="p-2 text-center">{t.siteVisits}</td>
                  <td className="p-2 text-center">{t.bookings}</td>
                  <td className="p-2 text-center">{t.callDelay || 0}</td>
                  <td className="p-2 text-center">{conversion}</td>
                  <td className="p-2 text-center">{t.autoWIP || 0}</td>
                  <td className="p-2 text-center">{t.manualWIP || 0}</td>
                  <td className="p-2 text-center">{t.autoWarm || 0}</td>
                  <td className="p-2 text-center">{t.manualWarm || 0}</td>
                  <td className="p-2 text-center">{t.autoCold || 0}</td>
                  <td className="p-2 text-center">{t.manualCold || 0}</td>
                </tr>
              );
            })}
            {/* Summary row */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2 text-right">Total</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.leads || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.autoLeads || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.manualLeads || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.called || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.siteVisits || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.bookings || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.callDelay || 0), 0)}</td>
              <td className="p-2 text-center">-</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.autoWIP || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.manualWIP || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.autoWarm || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.manualWarm || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.autoCold || 0), 0)}</td>
              <td className="p-2 text-center">{teamStats.reduce((sum, t) => sum + (t.manualCold || 0), 0)}</td>
            </tr>
          </tbody>
        </table>
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

  // Fetch all projects from Firestore
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      setProjects(snapshot.docs.map(doc => doc.id));
    } catch (err) {
      setError("Failed to fetch projects");
    }
    setLoading(false);
  };

  // Fetch selected project info
  const fetchProjectInfo = async (projectName) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'projects', projectName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProjectInfo(docSnap.data());
      } else {
        setProjectInfo({});
      }
    } catch (err) {
      setError("Failed to fetch project info");
    }
    setLoading(false);
  };

  // Fetch corrections for selected project
  const fetchCorrections = async (projectName) => {
    if (!projectName) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'projects', projectName, 'corrections'));
      setCorrections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError("Failed to fetch corrections");
    }
    setLoading(false);
  };

  // Save project info to Firestore
  const saveProjectInfo = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await setDoc(doc(db, 'projects', selectedProject), projectInfo, { merge: true });
      setSuccess("Project info updated!");
      setTimeout(() => { setSuccess(""); fetchProjects(); }, 2000);
    } catch (err) {
      setError("Failed to save project info");
    }
    setLoading(false);
  };

  // Create new project
  const createNewProject = async () => {
    setError(""); setSuccess("");
    if (!newProject.name) { setError("Project name required"); return; }
    setLoading(true);
    try {
      await setDoc(doc(db, 'projects', newProject.name), newProject.info);
      setSuccess("Project created!");
      setShowNewProject(false);
      setNewProject({ name: "", info: {} });
      fetchProjects();
    } catch (err) {
      setError("Failed to create project");
    }
    setLoading(false);
  };

  // Delete/resolve a correction
  const deleteCorrection = async (correctionId) => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'projects', selectedProject, 'corrections', correctionId));
      setCorrections(corrections.filter(c => c.id !== correctionId));
      setSuccess("Correction resolved/deleted");
      setTimeout(() => { setSuccess(""); }, 2000);
    } catch (err) {
      setError("Failed to delete correction");
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { if (selectedProject) { fetchProjectInfo(selectedProject); fetchCorrections(selectedProject); } }, [selectedProject]);

  if (!isAdmin) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h3 className="text-lg font-bold mb-4 text-blue-800">🛠️ Update Project Info</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="mb-4 flex gap-4 items-center">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="border p-2 rounded">
          <option value="">Select Project</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => setShowNewProject(!showNewProject)} className="bg-green-500 text-white px-3 py-1 rounded">{showNewProject ? "Cancel" : "Create New Project"}</button>
      </div>
      {showNewProject && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <input className="border p-2 rounded w-full mb-2" placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
          {/* Add fields for new project info as needed */}
          <textarea className="border p-2 rounded w-full mb-2" placeholder="Project Info (JSON)" value={JSON.stringify(newProject.info)} onChange={e => {
            try {
              setNewProject({ ...newProject, info: JSON.parse(e.target.value || '{}') });
              setError("");
            } catch {
              setError("Invalid JSON format for project info.");
            }
          }} />
          <button onClick={createNewProject} className="bg-blue-600 text-white px-4 py-2 rounded">Save Project</button>
        </div>
      )}
      {selectedProject && (
        <div>
          {Object.keys(projectInfo).map(key => (
            <div key={key} className="mb-2">
              <label className="block text-sm font-semibold text-gray-700">{key}</label>
              <input
                className="border p-2 rounded w-full"
                value={projectInfo[key]}
                onChange={e => setProjectInfo({ ...projectInfo, [key]: e.target.value })}
              />
            </div>
          ))}
          <button
            onClick={saveProjectInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Info"}
          </button>
        </div>
      )}
      {/* Corrections Section */}
      {selectedProject && corrections.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold text-blue-700 mb-2">Corrections/Flags for this Project</h4>
          <ul className="list-disc pl-6">
            {corrections.map(c => (
              <li key={c.id} className="mb-2 flex items-center gap-2">
                <span className="text-gray-700">[{c.field}] {c.rejectedItem} - <span className="italic text-xs">{c.reason}</span></span>
                <button onClick={() => deleteCorrection(c.id)} className="text-xs text-red-500 underline">Resolve/Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
