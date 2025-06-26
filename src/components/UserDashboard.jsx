import { useEffect, useState } from "react";
import LeadsTable from "./LeadsTable";

export default function UserDashboard({ email, name }) {
  const [status, setStatus] = useState("Active");
  const [stats, setStats] = useState({
    totalLeads: 0,
    callsMade: 0,
    delayedCalls: 0,
    breakTime: 0,
    siteVisits: 0,
    bookings: 0,
  });

  useEffect(() => {
    fetch(`https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbzeKaQOlSZPIGJbdmFCUmz-dNxGFdHTDPPKeUVg-aACZPYHsl9sVAkkc7Af3Lck8Jz8/exec/exec?email=${email}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to fetch stats", err));
  }, [email]);
  

  const toggleStatus = () => {
    const newStatus = status === "Active" ? "Break" : "Active";
    setStatus(newStatus);

    // TODO: Send status to Google Sheets via Apps Script or API
    console.log(`Status updated to: ${newStatus}`);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🙋 Welcome, {name}</h2>
      <p>{email}</p>

      <div style={{ margin: "10px 0" }}>
        <label>
          <input type="checkbox" checked={status === "Active"} onChange={toggleStatus} />
          {status}
        </label>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>📊 Today's Stats</h3>
        <ul>
          <li>Total Leads: {stats.totalLeads}</li>
          <li>Calls Made: {stats.callsMade}</li>
          <li>Delayed Calls: {stats.delayedCalls}</li>
          <li>Break Time: {stats.breakTime} mins</li>
          <li>Site Visits: {stats.siteVisits}</li>
          <li>Bookings: {stats.bookings}</li>
        </ul>
      </div>

      <LeadsTable email={email} isAdmin={false} />

      <button onClick={logout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}
