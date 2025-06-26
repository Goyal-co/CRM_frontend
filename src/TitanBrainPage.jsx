import { useState, useEffect } from "react";

export default function TitanBrainPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState([]);
  const [inputPassword, setInputPassword] = useState("");

  const password = "reset$123";

  const fetchEntries = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/wrong-entries");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch wrong entries", err);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/wrong-entries/${id}`, {
        method: "DELETE",
      });
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to delete entry", err);
    }
  };

  useEffect(() => {
    if (authenticated) fetchEntries();
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-4">🔒 Enter Password to Access Titan Brain</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputPassword === password) {
                setAuthenticated(true);
              }
            }}
            className="border p-3 w-full rounded mb-4"
          />
          <button
            onClick={() => {
              if (inputPassword === password) {
                setAuthenticated(true);
              } else {
                alert("Incorrect password");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">🧠 Titan Brain – Marked Wrong Entries</h2>
      {entries.length === 0 ? (
        <p>No wrong entries found.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-white p-4 shadow rounded">
              <p><strong>Project:</strong> {entry.project}</p>
              <p><strong>Field:</strong> {entry.field}</p>
              <p><strong>Rejected:</strong> {entry.rejectedItem}</p>
              <p><strong>Reason:</strong> {entry.reason}</p>
              <button
                onClick={() => deleteEntry(entry._id)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
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
