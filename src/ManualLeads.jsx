import { useEffect, useState } from "react";

export default function ManualLeads() {
  const email = localStorage.getItem("email");
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({
    project: "",
    name: "",
    phone: "",
    lookingFor: "",
    siteVisit: "",
    booked: "",
    feedback: "",
  });

  const scriptUrl = `https://script.google.com/macros/s/AKfycbyWzCFNuv-8Ugr-pzD4VJ08-QJ20RxvENe1bocm2Ya_2A02lrxH_WvmWddKqB_P8Ccm/exec`;

  const fetchManualLeads = async () => {
    const res = await fetch(`${scriptUrl}?action=getManualLeads&email=${email}`);
    const data = await res.json();
    setLeads(data); // show oldest first (default)
  };

  const handleInputChange = (field, value) => {
    setNewLead({ ...newLead, [field]: value });
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
    fetchManualLeads(); // reload list
  };

  useEffect(() => {
    fetchManualLeads();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Add New Manual Lead</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Project"
          value={newLead.project}
          onChange={(e) => handleInputChange("project", e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Name"
          value={newLead.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={newLead.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Looking For?"
          value={newLead.lookingFor}
          onChange={(e) => handleInputChange("lookingFor", e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={newLead.siteVisit}
          onChange={(e) => handleInputChange("siteVisit", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Site Visit?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <select
          value={newLead.booked}
          onChange={(e) => handleInputChange("booked", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Booked?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <input
          type="text"
          placeholder="Feedback"
          value={newLead.feedback}
          onChange={(e) => handleInputChange("feedback", e.target.value)}
          className="border rounded px-3 py-2 col-span-1 sm:col-span-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-black text-white rounded px-4 py-2 col-span-1 sm:col-span-2"
        >
          ➕ Add Lead
        </button>
      </div>

      {/* Manual Leads Table */}
      <h3 className="text-lg font-semibold mt-8 mb-2">Your Manual Leads</h3>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-xl text-sm">
          <thead className="bg-gray-200 text-gray-700">
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
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="p-2">{lead["Lead ID"]}</td>
                <td className="p-2">{lead["Project"]}</td>
                <td className="p-2">{lead["Name"]}</td>
                <td className="p-2">{lead["Phone Number"]}</td>
                <td className="p-2">{lead["Looking For?"]}</td>
                <td className="p-2">{lead["Assignee"]}</td>
                <td className="p-2">{lead["Site Visit?"]}</td>
                <td className="p-2">{lead["Booked?"]}</td>
                <td className="p-2">{lead["Feedback"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
