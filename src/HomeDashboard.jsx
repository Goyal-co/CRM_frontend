import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function HomeDashboard({ email: propEmail }) {
  const navigate = useNavigate();
  const [name, setName] = useState("User");
  const [dailyTip, setDailyTip] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const email = propEmail || localStorage.getItem("email");
    if (email) {
      const rawName = email.split("@")[0]?.split(/[._]/)[0];
      const capitalized = rawName
        ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
        : "User";
      setName(capitalized);
    }

    // ✅ Fetch daily tip
    fetch("https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec?action=getDailyTip")
      .then(res => res.json())
      .then(data => setDailyTip(data.tip || "No tip available today."))
      .catch(err => {
        console.error("Failed to load daily tip", err);
        setDailyTip("No tip available today.");
      });
  }, [propEmail]);

  const Card = ({ title, subtitle, icon, onClick, fullWidth }) => (
    <div
      className={`bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer ${fullWidth ? "col-span-2" : "w-full"}`}
      onClick={onClick}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-6 flex flex-col items-center relative">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {name}</h1>
        <p className="text-gray-500">Here is your dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card title="Performance" subtitle="Tap to view" icon="📊" onClick={() => navigate('/performance')} />
        <Card title="Leads" subtitle="Tap to manage" icon="📋" onClick={() => navigate('/leads')} />
        <Card title="Status" subtitle="Tap to update" icon="✅" onClick={() => navigate('/status')} />
        <Card title="Daily Tip" subtitle="Expand your knowledge" icon="💡" onClick={() => setShowModal(true)} />
        <Card title="Weekly Leaderboard" subtitle="See who's on top" icon="🏆" onClick={() => navigate('/leaderboard')} />
        <Card title="Your Upcoming Tasks" subtitle="Stay organized" icon="📅" onClick={() => navigate('/tasks')} />
        <Card
  title="PitchPal AI"
  subtitle="Get instant project insights"
  icon="🤖"
  onClick={() => navigate('/pitchpal')}
/>
        <Card title="Monthly Challenge" subtitle="Hit your goals" icon="🎯" onClick={() => navigate('/challenge')} fullWidth />
      </div>

      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 bg-gradient-to-b from-white/80 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button
              className="absolute top-2 right-4 text-xl font-bold text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              ❌
            </button>
            <h3 className="text-xl font-semibold mb-3 text-blue-900">💡 Today's Sales Tip</h3>
            <p className="text-gray-700">{dailyTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
