// ✅ unchanged imports
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";

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

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const fetchAdminStats = async () => {
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
      } catch (err) {
        console.error("Error fetching admin stats:", err);
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

      {/* ✅ Team Status Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Team Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teamStatus.map((member, index) => (
            <div key={index} className="flex justify-between items-center border p-3 rounded">
              <div>
                <p className="font-medium">{member.Name}</p>
                <p className="text-sm text-gray-500">{member.Email}</p>
              </div>
              <button
                onClick={() => toggleStatus(member.Email, index)}
                className={`px-4 py-1 rounded text-white text-sm ${member.Status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
              >
                {member.Status}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select onChange={e => handleFilterChange("project", e.target.value)} className="p-2 border rounded w-48">
          <option value="">All Projects</option>
          <option value="Orchid Life">Orchid Life</option>
          <option value="Orchid Salisbury">Salisbury</option>
          <option value="Orchid Bloomsberry">Orchid Bloomsberry</option>
          <option value="Orchid Platinum">Orchid Platinum</option>
          <option value="RIVIERA UNO" && "Riviera Uno">Rivirea Uno</option>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard title="Total Leads" value={teamStats.reduce((sum, m) => sum + m.leads, 0)} color="bg-blue-500" />
        <SummaryCard title="Site Visits" value={teamStats.reduce((sum, m) => sum + m.siteVisits, 0)} color="bg-green-500" />
        <SummaryCard title="Bookings" value={teamStats.reduce((sum, m) => sum + m.bookings, 0)} color="bg-purple-500" />
        <SummaryCard title="Call Delay" value={teamStats.reduce((sum, m) => sum + (m.callDelay || 0), 0)} color="bg-yellow-500" />
        <SummaryCard
          title="Conversion %"
          value={teamStats.length > 0
            ? ((teamStats.reduce((sum, m) => sum + m.bookings, 0) / teamStats.reduce((sum, m) => sum + m.leads, 1)) * 100).toFixed(1) + "%"
            : "0%"}
          color="bg-indigo-500"
        />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Team Leaderboard</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2">Leads</th>
              <th className="p-2">Called</th>
              <th className="p-2">Site Visits</th>
              <th className="p-2">Bookings</th>
              <th className="p-2">Call Delays</th>
              <th className="p-2">Conversion %</th>
            </tr>
          </thead>
          <tbody>
            {teamStats.map((t, i) => {
              const conversion = t.bookings && t.leads ? ((t.bookings / t.leads) * 100).toFixed(1) + "%" : "0%";
              return (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2 text-center">{t.leads}</td>
                  <td className="p-2 text-center">{t.called}</td>
                  <td className="p-2 text-center">{t.siteVisits}</td>
                  <td className="p-2 text-center">{t.bookings}</td>
                  <td className="p-2 text-center">{t.callDelay || 0}</td>
                  <td className="p-2 text-center">{conversion}</td>
                </tr>
              );
            })}
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
