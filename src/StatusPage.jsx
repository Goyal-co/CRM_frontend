import { useEffect, useState } from 'react';

export default function StatusPage() {
  const email = localStorage.getItem("email");
  const [status, setStatus] = useState("active");
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const scriptUrl = "https://script.google.com/macros/s/AKfycbyWzCFNuv-8Ugr-pzD4VJ08-QJ20RxvENe1bocm2Ya_2A02lrxH_WvmWddKqB_P8Ccm/exec";

  const fetchStatus = async () => {
    const res = await fetch(`${scriptUrl}?action=getStatus&email=${email}`);
    const data = await res.json();
    setStatus(data.status);
    setBreakMinutes(data.breakMinutes || 0);
    setLoading(false);
  };

  const toggleStatus = async (newStatus) => {
    if (status === newStatus) return;
    setStatus(newStatus);
    await fetch(`${scriptUrl}?action=updateStatus&email=${email}&status=${newStatus}`);
    fetchStatus(); // refresh break time
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading status...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-6">Activity Status</h2>

        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => toggleStatus("active")}
              className={`px-6 py-2 font-semibold ${
                status === "active" ? "bg-green-500 text-white" : "text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => toggleStatus("break")}
              className={`px-6 py-2 font-semibold ${
                status === "break" ? "bg-red-500 text-white" : "text-gray-700"
              }`}
            >
              Break
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="text-5xl">
            {status === "active" ? "✅" : "🛑"}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-1">
          Status is {status}
        </h3>

        <p className="text-gray-600 mb-4">
          Your activity status is currently set {status}.
        </p>

        <p className="text-lg font-semibold mb-6">
          Break time: {breakMinutes} minutes
        </p>

        <button
          onClick={() => window.history.back()}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold"
        >
          OK
        </button>
      </div>
    </div>
  );
}
