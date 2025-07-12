import { useState } from "react";
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL;

export default function PitchPalPage() {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [corrections, setCorrections] = useState([]);

  // Fetch corrections from Firestore
  const fetchCorrections = async (projectName) => {
    if (!projectName) return [];
    const correctionsRef = collection(db, 'projects', projectName, 'corrections');
    const snapshot = await getDocs(correctionsRef);
    return snapshot.docs.map(doc => doc.data());
  };

  // Fetch project info from Firestore
  const fetchProjectInfo = async (projectName) => {
    const docRef = doc(db, 'projects', projectName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setInsights(null);
    try {
      // Fetch project info from Firestore
      const projectInfo = await fetchProjectInfo(projectName);
      if (!projectInfo) {
        alert("❌ Project not found or incomplete data.");
        setLoading(false);
        return;
      }
      // Fetch corrections from Firestore
      const correctionsArr = await fetchCorrections(projectName);
      setCorrections(correctionsArr);
      // Send to backend AI endpoint, including corrections
      const backendRes = await fetch(`${API_URL}/api/generate-pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectInfo, corrections: correctionsArr }),
      });
      const aiInsights = await backendRes.json();
      setInsights({ projectInfo, ...aiInsights });
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
  🧠 Titan PitchPal AI
</h2>


      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter exact project name (e.g., Orchid Platinum)"
          className="border border-gray-300 p-3 rounded w-full"
        />
        <button
          onClick={fetchInsights}
          disabled={loading || !projectName}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold transition"
        >
          {loading ? "Generating..." : "Generate Insights"}
        </button>
      </div>

      {insights && (
        <div className="space-y-6">
          <Section title="📌 Project Info" content={formatProjectInfo(insights.projectInfo)} />
<Section title="🎯 Why This Project?" content={insights.whyThis} projectName={projectName} fieldKey="whyThis" />
<Section title="📊 Top Nearby Projects" content={insights.nearbyProjects} projectName={projectName} fieldKey="nearbyProjects" />
<Section title="🧠 Pitch Lines" content={insights.pitchLines} projectName={projectName} fieldKey="pitchLines" />
<Section title="❓ FAQs" content={insights.faqs} projectName={projectName} fieldKey="faqs" />
<Section title="💬 WhatsApp Message" content={insights.whatsappMessage} projectName={projectName} fieldKey="whatsappMessage" />


          {insights.priceJustification && (
  <Section title="💸 Price Justification" content={insights.priceJustification} />
)}

{insights.objectionHandler && (
  <Section title="🧠 Objection Handler" content={insights.objectionHandler} />
)}

{insights.financeTips && (
  <Section title="💡 Finance & Tax Tips" content={insights.financeTips} />
)}

        </div>
        
      )}
    </div>
  );
}

function Section({ title, content, projectName, fieldKey }) {
  const [corrections, setCorrections] = useState({});
  const [rejectedItems, setRejectedItems] = useState([]);

  const handleMarkWrong = async (item, index) => {
    const reason = prompt("Why is this wrong?");
    if (!reason) return;
    const flaggedBy = localStorage.getItem("email") || "unknown";
    // Save to Firestore corrections
    await addDoc(collection(db, 'projects', projectName, 'corrections'), {
      field: fieldKey,
      rejectedItem: typeof item === "string" ? item : JSON.stringify(item),
      reason,
      flaggedBy,
      timestamp: new Date().toISOString(),
    });
    setRejectedItems((prev) => [...prev, index]);
    alert("Marked as wrong. Thanks for the feedback!");
  };

  return (
    <div className="bg-white shadow rounded-xl p-5">
      <h3 className="text-xl font-bold text-blue-800 mb-3">{title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {content.map((item, index) => (
            <li key={index} className="flex justify-between items-center gap-2">
              <span className={rejectedItems.includes(index) ? "line-through text-red-500" : ""}>
                {typeof item === "object" ? JSON.stringify(item) : item}
              </span>
              {!rejectedItems.includes(index) && (
                <button
                  onClick={() => handleMarkWrong(item, index)}
                  className="text-sm text-red-500 underline"
                >
                  Mark Wrong
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}



function formatProjectInfo(info) {
  return Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}
