import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
const ITEMS_PER_PAGE = 5;


export default function LeadDetailPage() {
  const { email } = useParams();
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/leads')
      .then(res => {
        const fullEmail = decodeURIComponent(email);             // sahil.bng@goyalco.com
        const username = fullEmail.split('@')[0];                // sahil.bng
        const nameGuess = username.split('.')[0];                // sahil

        const filtered = res.data.filter(
          (lead) => lead.assignedTo?.toLowerCase() === nameGuess.toLowerCase()
        );

        setLeads(filtered);
      })
      .catch(err => {
        console.error("Error fetching leads:", err);
        setLeads([]);
      });
  }, [email]);

  const formatLeadId = (createdAt) => {
    if (!createdAt) return "L000000";
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `L${day}${hours}${mins}`;
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Leads Assigned to: <b>{decodeURIComponent(email)}</b></h2>
      <h3>Leads</h3>
      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ margin: 'auto' }}>
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Project</th>
              <th>Source</th>
              <th>Status</th>
              <th>Call Time</th>
              <th>Call Delayed?</th>
              <th>Feedbacks</th>
              <th>Site Visit?</th>
              <th>Visit Date</th>
              <th>Booked?</th>
              <th>Lead Quality</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>{formatLeadId(lead.createdAt)}</td>
                <td>{lead.name || "-"}</td>
                <td>{lead.phone || "-"}</td>
                <td>{lead.email || "-"}</td>
                <td>{lead.project || "-"}</td>
                <td>{lead.source || "-"}</td>
                <td>{lead.status || "-"}</td>
                <td>{lead.callTime ? new Date(lead.callTime).toLocaleString() : "Not Called"}</td>
                <td>{lead.callDelayed ? "Yes" : "No"}</td>
                <td>{Array.isArray(lead.feedbacks) ? lead.feedbacks.length : 0}</td>
                <td>{lead.siteVisit ? "Yes" : "No"}</td>
                <td>{lead.siteVisitDate ? new Date(lead.siteVisitDate).toLocaleDateString() : "-"}</td>
                <td>{lead.booked ? "Yes" : "No"}</td>
                <td>{lead.quality || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
      <button onClick={() => navigate('/')}>← Back to Dashboard</button>
    </div>
  );
}
