import { useEffect, useState } from "react";
import axios from "axios";

export default function LeadsTable({ email, isAdmin }) {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/leads").then((res) => {
      const filtered = isAdmin
        ? res.data
        : res.data.filter((lead) => lead.assignedTo === email);
      setLeads(filtered);
    });
  }, []);

  const formatDate = (iso) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(iso).toLocaleString('en-IN', options);
  };

  const getStatusColor = (status) => {
    if (status === 'called') return "green";
    if (status === 'delayed') return "red";
    return "gray";
  };

  return (
    <div>
      <h4>Leads</h4>
      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ margin: "auto" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Project</th>
              <th>Source</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Call Time</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.project}</td>
                <td>{lead.source}</td>
                <td style={{ color: getStatusColor(lead.status) }}>{lead.status}</td>
                <td>{lead.assignedTo}</td>
                <td>{lead.callTime ? formatDate(lead.callTime) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
