import { useState, useEffect } from "react";

export default function TitanAiCallAnalysis() {
  const [filters, setFilters] = useState({ member: "", dateRange: "" });
  const [callData, setCallData] = useState([]);

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/call-analysis?member=${filters.member}&dateRange=${filters.dateRange}`);
        const data = await res.json();
        setCallData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching call analysis:", err);
      }
    };

    fetchCallData();
  }, [filters]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Titan AI Call Analysis</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select onChange={(e) => setFilters({ ...filters, member: e.target.value })} className="p-2 border rounded w-48">
          <option value="">All Members</option>
          <option value="Pratham">Pratham</option>
          <option value="Sahil">Sahil</option>
          <option value="Srinivas">Srinivas</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })} className="p-2 border rounded w-48">
          <option value="">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 text-yellow-600">AI Summary & Call Insights</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 text-left">Agent</th>
                <th className="p-2 text-left">Call Summary</th>
                <th className="p-2 text-left">Pitch Score</th>
                <th className="p-2 text-left">Mistakes</th>
                <th className="p-2 text-left">Customer Tone</th>
                <th className="p-2 text-left">Follow-up Tip</th>
                <th className="p-2 text-left">Recording {/* ❌ remove after launch if not needed */}</th>
              </tr>
            </thead>
            <tbody>
              {callData.map((entry, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-2">{entry.agent}</td>
                  <td className="p-2">{entry.summary}</td>
                  <td className="p-2">{entry.pitchScore}/10</td>
                  <td className="p-2">{entry.mistakes}</td>
                  <td className="p-2">{entry.tone}</td>
                  <td className="p-2">{entry.recommendation}</td>
                  <td className="p-2 text-center">
                    <audio controls preload="none" style={{ maxWidth: 180 }}>
                      <source src={`http://localhost:5000${entry.filePath}`} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </td>
                </tr>
              ))}
              {callData.length === 0 && (
                <tr>
                  <td className="p-2 text-center text-gray-500" colSpan="7">No call analysis data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
