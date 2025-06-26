import { useState } from "react";

export default function PitchPalPage() {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setInsights(null);

    try {
      // Fetch project info from Google Sheet
      const sheetRes = await fetch(
        `https://script.google.com/macros/s/AKfycbyWzCFNuv-8Ugr-pzD4VJ08-QJ20RxvENe1bocm2Ya_2A02lrxH_WvmWddKqB_P8Ccm/exec?action=getProjectInfo&project=${encodeURIComponent(projectName)}`
      );
      const projectInfo = await sheetRes.json();

      if (projectInfo?.error || !projectInfo["Project Name"]) {
        alert("❌ Project not found or incomplete data.");
        setLoading(false);
        return;
      }

      // Send to backend AI endpoint
      const backendRes = await fetch("https://crm-frontend-rudra-avulas-projects.vercel.app/api/generate-pitch" || "https://crm-frontend-virid-theta.vercel.app/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectInfo }),
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

    await fetch("http://localhost:5000/api/admin/wrong-entries", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: projectName,
        field: fieldKey,
        rejectedItem: typeof item === "string" ? item : JSON.stringify(item),
        reason,
        flaggedBy,
      }),
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
