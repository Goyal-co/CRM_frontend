import { useState } from "react";
import AutoLeadsSection from "./AutoLeadsSection";
import ManualLeadsSection from "./ManualLeadsSection";


export default function LeadsPage() {
  const [tab, setTab] = useState("auto");
  const email = localStorage.getItem("email");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">My Leads</h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setTab("auto")}
          className={`px-6 py-2 rounded-l-lg font-semibold ${
            tab === "auto" ? "bg-black text-white" : "bg-white text-black border"
          }`}
        >
          Auto Leads
        </button>
        <button
          onClick={() => setTab("manual")}
          className={`px-6 py-2 rounded-r-lg font-semibold ${
            tab === "manual" ? "bg-black text-white" : "bg-white text-black border"
          }`}
        >
          Manual Leads
        </button>
      </div>

      {tab === "auto" ? <AutoLeadsSection email={email} /> : <ManualLeadsSection email={email} />}
    </div>
  );
}
