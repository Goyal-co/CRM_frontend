import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const scriptUrl = "https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec";

  useEffect(() => {
    fetch(`${scriptUrl}?action=getAdminStats&dateRange=7d`)
      .then(res => res.json())
      .then(res => {
        const sortedData = [...(res.teamStats || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
        setData(sortedData);
      })
      .catch(err => console.error("Leaderboard fetch failed", err));
  }, []);

  const getMedal = (rank) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `${rank + 1}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-10">
        <h2 className="text-5xl font-extrabold mb-10 text-center text-gray-800 flex items-center justify-center gap-4">
          <span role="img" aria-label="trophy">🏆</span>
          Weekly Leaderboard
        </h2>

        {Array.isArray(data) && data.length > 0 ? (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-lg text-left rounded-xl overflow-hidden border border-gray-200">
              <thead className="bg-blue-800 text-white text-xl">
                <tr>
                  <th className="p-5">Rank</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Leads</th>
                  <th className="p-5">Auto Leads</th>
                  {/* <th className="p-5">Manual Leads</th> */}
                  <th className="p-5">Site Visits</th>
                  <th className="p-5">Bookings</th>
                  <th className="p-5">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.map((member, index) => (
                  <tr key={index} className="border-b hover:bg-blue-50 text-gray-800 font-semibold text-lg">
                    <td className="p-5">{getMedal(index)}</td>
                    <td className="p-5">{member.name}</td>
                    <td className="p-5">{(member.autoLeads || 0) + (member.manualLeads || 0)}</td>
                    <td className="p-5">{member.autoLeads || 0}</td>
                    {/* <td className="p-5">{member.manualLeads || 0}</td> */}
                    <td className="p-5">{member.siteVisits || 0}</td>
                    <td className="p-5">{member.bookings || 0}</td>
                    <td className="p-5">{member.score || 0}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-600 font-medium text-xl">
            No leaderboard data found.
          </div>
        )}
      </div>
    </div>
  );
}
