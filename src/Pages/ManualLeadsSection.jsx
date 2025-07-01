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
    feedback: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const scriptUrl = `https://script.google.com/macros/s/AKfycbwzfrMTurwHJ7BllZuCpMLzrmZC8nOraJ2eEOhY4ZCuWgWn50zZ3A4nwwb-a9tTdAmr/exec`;

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
    });

    await fetch(`${scriptUrl}?${params.toString()}`);
    setNewLead({
      project: "",
      name: "",
      phone: "",
      lookingFor: "",
      siteVisit: "",
      booked: "",
      feedback: "",
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
    for (const [field, value] of Object.entries({
      "Site Visit?": fields.siteVisit,
      "Booked?": fields.booked,
      "Feedback": fields.feedback,
    })) {
      const params = new URLSearchParams({
        action: "updateManualLead",
        leadId,
        field,
        value,
      });
      await fetch(`${scriptUrl}?${params}`);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Project" value={newLead.project} onChange={(e) => handleInputChange("project", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
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
        </div>
        <textarea
          placeholder="Feedback"
          value={newLead.feedback}
          onChange={(e) => handleInputChange("feedback", e.target.value)}
          className="w-full border border-blue-200 rounded px-3 py-2 mb-4"
        />
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
              <th className="p-2">Feedback</th>
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
                      <select value={values.siteVisit} onChange={(e) => handleEditInput(id, "siteVisit", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : lead["Site Visit?"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <select value={values.booked} onChange={(e) => handleEditInput(id, "booked", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : lead["Booked?"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <input type="text" value={values.feedback} onChange={(e) => handleEditInput(id, "feedback", e.target.value)} className="border px-2 py-1 rounded w-full" />
                    ) : lead["Feedback"]}
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
