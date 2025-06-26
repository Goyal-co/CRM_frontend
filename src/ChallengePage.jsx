import { useEffect, useState } from "react";

export default function ChallengePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(
          `https://script.google.com/macros/s/AKfycbyWzCFNuv-8Ugr-pzD4VJ08-QJ20RxvENe1bocm2Ya_2A02lrxH_WvmWddKqB_P8Ccm/exec?action=getMonthlyChallenge&email=${email}`
        );
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch challenge", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [email]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading challenge...</div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-6 text-center text-red-600 text-lg font-medium">
        ❌ No challenge set for this month.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex flex-col items-center relative overflow-hidden">
      {/* 🎁 Voucher Background Image (faded) */}

      <h2 className="text-3xl font-bold text-blue-900 mb-6 z-10">
        🎯 Monthly Challenge
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl z-10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold text-gray-700">Month: {data.month}</p>
          {data.prize && (
            <p className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
              🏆 Prize: {data.prize}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Metric label="Target Site Visits" value={data.siteVisitTarget} />
          <Metric label="Your Site Visits" value={data.siteVisitDone} />
          <Metric label="Target Bookings" value={data.bookingTarget} />
          <Metric label="Your Bookings" value={data.bookingDone} />
        </div>

        <div className="text-center mt-4">
          {data.completed ? (
            <p className="text-green-600 font-bold text-xl">
              ✅ Challenge Completed! 🎉 You're eligible for the reward.
            </p>
          ) : (
            <p className="text-orange-600 font-semibold text-lg">
              🚀 Keep pushing! You're on the way to the reward.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-blue-50 p-6 rounded-xl text-center shadow-md min-w-[160px]">
      <p className="text-base text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-blue-900">{value}</p>
    </div>
  );
}