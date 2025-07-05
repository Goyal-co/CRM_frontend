import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LeadDetailPage() {
  const { email } = useParams();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
  const url = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec?email=${email}`;

  fetch(url)
  .then((res) => res.json())
  .then((data) => {
    if (data.error) {
      console.error("Script error:", data.error);
      setLeads([]);
    } else {
      setLeads(data);
    }
  })
  .catch((err) => console.error("Fetch error:", err));
}, [email]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Leads Assigned to: {decodeURIComponent(email)}</h2>

      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "24px",
          fontSize: "14px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 12px rgba(0,0,0,0.05)"
        }}>
          <thead style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
            <tr>
              {[
                "Lead ID", "Name", "Phone", "Email", "Project", "Source",
                "Status", "Call Time", "Feedbacks", "Site Visit?", "Booked?", "Lead Quality"
              ].map((heading, i) => (
                <th key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #eaeaea" }}>{heading}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leads.map((lead, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "12px 16px" }}>{lead["Lead ID"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Name"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Phone"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Email"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Project"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Source"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Status"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Call Time"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Feedbacks"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Site Visit?"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Booked?"]}</td>
                <td style={{ padding: "12px 16px" }}>{lead["Lead Quality"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
