import { useState, useEffect } from "react";

export default function ManualLeadsSection({ email }) {
  const [leads, setLeads] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [successMessage, setSuccessMessage] = useState(""); // ✅ toast state
  const [newLead, setNewLead] = useState({
    project: "",
    name: "",
    phone: "",
    lookingFor: "",
    siteVisit: "",
    booked: "",
    feedback1: "",
    feedback2: "",
    feedback3: "",
    feedback4: "",
    feedback5: "",
    leadQuality: "", // Add leadQuality to newLead state
  });

  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const scriptUrl = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec`;

  const fetchManualLeads = async () => {
    const res = await fetch(`${scriptUrl}?action=getManualLeads&email=${email}`);
    const data = await res.json();
    setLeads(data);

    const values = {};
    data.forEach((lead) => {
      values[lead["Lead ID"]] = {
        siteVisit: lead["Site Visit?"],
        booked: lead["Booked?"],
        feedback: lead["Feedback"],
      };
    });
    setEditedValues(values);
  };

  const handleInputChange = (field, value) => {
    setNewLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!newLead.name || !newLead.phone || !newLead.project) {
      alert("Name, Phone, and Project are required.");
      return;
    }

    const leadId = "ML" + Date.now().toString().slice(-6);
    const params = new URLSearchParams({
      action: "addManualLead",
      leadId,
      email,
      ...newLead,
      "Lead Quality": newLead.leadQuality,
    });

    await fetch(`${scriptUrl}?${params.toString()}`);
    setNewLead({
      project: "",
      name: "",
      phone: "",
      lookingFor: "",
      siteVisit: "",
      booked: "",
      feedback1: "",
      feedback2: "",
      feedback3: "",
      feedback4: "",
      feedback5: "",
      leadQuality: "",
    });
    setCurrentPage(1);
    fetchManualLeads();
  };

  const handleEditInput = (leadId, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (leadId) => {
    const fields = editedValues[leadId];
    const updateFields = {
      "Site Visit?": fields.siteVisit,
      "Booked?": fields.booked,
      "Lead Quality": fields.leadQuality,
      "Feedback 1": fields.feedback1,
      "Feedback 2": fields.feedback2,
      "Feedback 3": fields.feedback3,
      "Feedback 4": fields.feedback4,
      "Feedback 5": fields.feedback5,
    };
    for (const [field, value] of Object.entries(updateFields)) {
      if (typeof value !== "undefined") {
        const params = new URLSearchParams({
          action: "updateManualLead",
          leadId,
          field,
          value,
        });
        await fetch(`${scriptUrl}?${params}`);
      }
    }
    setSuccessMessage("Lead updated successfully!");
    fetchManualLeads();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    fetchManualLeads();
  }, []);

  const sortedLeads = [...leads].reverse();
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  // Calculate quality counts
  const qualityCounts = { WIP: 0, Warm: 0, Cold: 0 };
  leads.forEach(l => {
    if (l["Lead Quality"] === "WIP") qualityCounts.WIP++;
    else if (l["Lead Quality"] === "Warm") qualityCounts.Warm++;
    else if (l["Lead Quality"] === "Cold") qualityCounts.Cold++;
  });

  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm relative">
      {/* ✅ Toast */}
      {successMessage && (
        <div
          id="success-toast"
          className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in z-50"
        >
          ✅ {successMessage}
        </div>
      )}

      {/* Add New Lead Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">➕ Add New Manual Lead</h3>
        <div className="flex gap-4 mb-4">
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded font-bold">WIP: {qualityCounts.WIP}</div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded font-bold">Warm: {qualityCounts.Warm}</div>
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-bold">Cold: {qualityCounts.Cold}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={newLead.project}
            onChange={(e) => handleInputChange("project", e.target.value)}
            className="border border-blue-200 rounded px-3 py-2"
          >
            <option value="">Select Project</option>
            <option value="Orchid Life">Orchid Life</option>
            <option value="Orchid Salisbury">Orchid Salisbury</option>
            <option value="Orchid Bloomsberry">Orchid Bloomsberry</option>
            <option value="Orchid Platinum">Orchid Platinum</option>
            <option value="Riviera Uno">Riviera Uno</option>
          </select>
          <input type="text" placeholder="Name" value={newLead.name} onChange={(e) => handleInputChange("name", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
          <input type="text" placeholder="Phone Number" value={newLead.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
          <input type="text" placeholder="Looking For?" value={newLead.lookingFor} onChange={(e) => handleInputChange("lookingFor", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
          <select value={newLead.siteVisit} onChange={(e) => handleInputChange("siteVisit", e.target.value)} className="border border-blue-200 rounded px-3 py-2">
            <option value="">Site Visit?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <select value={newLead.booked} onChange={(e) => handleInputChange("booked", e.target.value)} className="border border-blue-200 rounded px-3 py-2">
            <option value="">Booked?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <select value={newLead.leadQuality} onChange={(e) => handleInputChange("leadQuality", e.target.value)} className="border border-blue-200 rounded px-3 py-2">
            <option value="">Lead Quality</option>
            <option value="WIP">WIP</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
          <input type="text" placeholder="Feedback 1" value={newLead.feedback1} onChange={(e) => handleInputChange("feedback1", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
        </div>
        <button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold">
          ➕ Add Lead
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Manual Leads List</h3>

        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-2">Lead ID</th>
              <th className="p-2">Project</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Looking For?</th>
              <th className="p-2">Assignee</th>
              <th className="p-2">Site Visit?</th>
              <th className="p-2">Booked?</th>
              <th className="p-2">Lead Quality</th>
              <th className="p-2">Feedback 1</th>
              <th className="p-2">Feedback 2</th>
              <th className="p-2">Feedback 3</th>
              <th className="p-2">Feedback 4</th>
              <th className="p-2">Feedback 5</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead, idx) => {
              const id = lead["Lead ID"];
              const isEditable = lead["Assignee"] === email;
              const values = editedValues[id] || {};

              return (
                <tr key={idx} className="border-b hover:bg-blue-50">
                  <td className="p-2">{id}</td>
                  <td className="p-2">{lead["Project"]}</td>
                  <td className="p-2">{lead["Name"]}</td>
                  <td className="p-2">{lead["Phone Number"]}</td>
                  <td className="p-2">{lead["Looking For?"]}</td>
                  <td className="p-2">{lead["Assignee"]}</td>
                  <td className="p-2">
                    {isEditable ? (
                      <select value={values.siteVisit || lead["Site Visit?"]} onChange={(e) => handleEditInput(id, "siteVisit", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : lead["Site Visit?"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <select value={values.booked || lead["Booked?"]} onChange={(e) => handleEditInput(id, "booked", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : lead["Booked?"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <select value={values.leadQuality || lead["Lead Quality"] || ""} onChange={(e) => handleEditInput(id, "leadQuality", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="">Lead Quality</option>
                        <option value="WIP">WIP</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                      </select>
                    ) : lead["Lead Quality"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <input type="text" value={values.feedback1 || lead["Feedback 1"] || ""} onChange={(e) => handleEditInput(id, "feedback1", e.target.value)} className="border px-2 py-1 rounded w-full" />
                    ) : lead["Feedback 1"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <input type="text" value={values.feedback2 || lead["Feedback 2"] || ""} onChange={(e) => handleEditInput(id, "feedback2", e.target.value)} className="border px-2 py-1 rounded w-full" />
                    ) : lead["Feedback 2"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <input type="text" value={values.feedback3 || lead["Feedback 3"] || ""} onChange={(e) => handleEditInput(id, "feedback3", e.target.value)} className="border px-2 py-1 rounded w-full" />
                    ) : lead["Feedback 3"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <input type="text" value={values.feedback4 || lead["Feedback 4"] || ""} onChange={(e) => handleEditInput(id, "feedback4", e.target.value)} className="border px-2 py-1 rounded w-full" />
                    ) : lead["Feedback 4"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <input type="text" value={values.feedback5 || lead["Feedback 5"] || ""} onChange={(e) => handleEditInput(id, "feedback5", e.target.value)} className="border px-2 py-1 rounded w-full" />
                    ) : lead["Feedback 5"]}
                  </td>
                  <td className="p-2">
                    {isEditable && (
                      <button onClick={() => handleUpdate(id)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded">
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            ⬅ Previous
          </button>
          <span className="mt-2 text-blue-800 font-semibold">Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
}

export function getManualLeadsCount(leads) {
  return Array.isArray(leads) ? leads.length : 0;
}
