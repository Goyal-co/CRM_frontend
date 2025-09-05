import { useEffect, useState } from "react";
import VideoLoader from "./components/VideoLoader";

export default function PerformancePage() {
  const email = localStorage.getItem("email");
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({
    totalCalls: 0,
    delays: 0,
    siteVisits: 0,
    bookings: 0,
    breakMinutes: 0,
    score: 0,
  });

  const fetchPerformance = async () => {
    const url = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec?action=getPerformance&email=${email}`;
    const res = await fetch(url);
    const data = await res.json();
    setPerformance(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <VideoLoader 
          message="Loading performance data..." 
          size="large"
          className="min-h-screen"
        />
      </div>
    );
  }

  const Card = ({ title, value, icon }) => (
    <div className="bg-white rounded-xl shadow-md p-5 text-center w-full max-w-xs">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-xl font-bold">{value}</h3>
      <p className="text-gray-600 mt-1">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Performance</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card title="Total Calls" value={performance.totalCalls} icon="📞" />
        <Card title="Call Delays" value={performance.delays} icon="⏱️" />
        <Card title="Site Visits" value={performance.siteVisits} icon="📍" />
        <Card title="Bookings" value={performance.bookings} icon="✅" />
        <Card title="Break Minutes" value={performance.breakMinutes} icon="☕" />
      </div>

      <div className="bg-black text-white px-6 py-4 rounded-full text-lg font-semibold shadow-md">
        🧠 Score: {performance.score}
      </div>
    </div>
  );
}
