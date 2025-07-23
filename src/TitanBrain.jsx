import { useEffect, useState } from "react";
import axios from "axios";

export default function TitanBrain() {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  const SECRET_PASSWORD = "titan@321"; // ✅ You can change this

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://api.goyalhariyanacrm.in/api/pitchCorr/get-corrections?project=Orchid Platinum");
      setCorrections(res.data.filter(item => item.markedAsWrong)); // ✅ Only show marked wrong
    } catch (err) {
      console.error("Error fetching corrections:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCorrection = async (id) => {
    try {
      await axios.delete(`https://api.goyalhariyanacrm.in/api/pitchCorr/${id}`);
      setCorrections((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      console.error("Failed to delete correction:", err);
    }
  };

  const handleUnlock = () => {
    if (inputPassword === SECRET_PASSWORD) {
      setAuthenticated(true);
      fetchCorrections();
    } else {
      alert("Incorrect password");
    }
  };

  if (!authenticated) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px" }}>🔒 Enter Password to Access Titan Brain</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          style={{
            padding: "12px",
            width: "100%",
            fontSize: "16px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={handleUnlock}
          style={{
            padding: "12px",
            width: "100%",
            fontSize: "16px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Unlock
        </button>
      </div>
    </div>
  );
}





  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">🧠 Titan Brain – AI Corrections</h2>
      {loading ? (
        <p>Loading...</p>
      ) : corrections.length === 0 ? (
        <p>No AI corrections submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {corrections.map((item) => (
            <div key={item._id} className="border p-4 rounded-lg bg-gray-50 relative">
              <p><strong>Project:</strong> {item.project}</p>
              <p><strong>Section:</strong> {item.field}</p>
              <p><strong>Wrong:</strong> {item.correctedText}</p>
              <p className="text-sm text-gray-500">Marked Wrong: {item.markedAsWrong ? "Yes" : "No"}</p>
              <button
                onClick={() => deleteCorrection(item._id)}
                className="absolute top-2 right-2 text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
