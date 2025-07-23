import { useState, useEffect } from "react";

export default function TitanAiCallAnalysis() {
  const [agentStats, setAgentStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndAggregate = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://api.goyalhariyanacrm.in/api/call-recordings");
        const data = await res.json();
        const calls = Array.isArray(data.recordings) ? data.recordings : [];
        // Aggregate by agent
        const stats = {};
        calls.forEach(call => {
          if (!call.analysis || !call.executive) return;
          const agent = call.executive;
          if (!stats[agent]) {
            stats[agent] = {
              agent,
              totalCalls: 0,
              pitchScores: [],
              tones: {},
            };
          }
          stats[agent].totalCalls += 1;
          if (typeof call.analysis.pitchScore === 'number') {
            stats[agent].pitchScores.push(call.analysis.pitchScore);
          }
          const tone = call.analysis.customerTone || call.analysis.tone;
          if (tone) {
            stats[agent].tones[tone] = (stats[agent].tones[tone] || 0) + 1;
          }
        });
        // Prepare summary per agent
        const summary = Object.values(stats).map(agentStat => {
          const avgPitch = agentStat.pitchScores.length
            ? (agentStat.pitchScores.reduce((a, b) => a + b, 0) / agentStat.pitchScores.length).toFixed(2)
            : 'N/A';
          // Find most common tone
          let mostCommonTone = 'N/A';
          let maxTone = 0;
          for (const [tone, count] of Object.entries(agentStat.tones)) {
            if (count > maxTone) {
              mostCommonTone = tone;
              maxTone = count;
            }
          }
          return {
            agent: agentStat.agent,
            totalCalls: agentStat.totalCalls,
            avgPitchScore: avgPitch,
            mostCommonTone,
          };
        });
        setAgentStats(summary);
      } catch (err) {
        setAgentStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAndAggregate();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Titan AI Agent Analysis</h2>
      <div className="bg-white p-4 rounded-xl shadow max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-yellow-600">Agent Performance Summary</h3>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 text-left">Agent</th>
                  <th className="p-2 text-left">Total Calls</th>
                  <th className="p-2 text-left">Avg. Pitch Score</th>
                  <th className="p-2 text-left">Most Common Tone</th>
                </tr>
              </thead>
              <tbody>
                {agentStats.map((stat, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-semibold">{stat.agent}</td>
                    <td className="p-2">{stat.totalCalls}</td>
                    <td className="p-2">{stat.avgPitchScore}</td>
                    <td className="p-2">{stat.mostCommonTone}</td>
                  </tr>
                ))}
                {agentStats.length === 0 && (
                  <tr>
                    <td className="p-2 text-center text-gray-500" colSpan="4">No agent analysis data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
