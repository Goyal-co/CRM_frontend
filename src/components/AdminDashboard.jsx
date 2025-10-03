import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamCard from './TeamCard';



const dummyTeam = [
  {
    name: "Pratham",
    email: "pratham.bng@goyalco.com",
    designation: "Presales Executive",
    status: "active",
  },
  {
    name: "Sahil",
    email: "sahil.bng@goyalco.com",
    designation: "Presales Executive",
    status: "leave",
  },
  {
    name: "Srinivas",
    email: "srinivas.bng@goyalco.com",
    designation: "Presales Executive",
    status: "active",
  },
];


export default function AdminDashboard() {
  const [team, setTeam] = useState(dummyTeam);
  const navigate = useNavigate();

  const toggleStatus = (email) => {
    const updated = team.map((member) =>
      member.email === email
        ? { ...member, status: member.status === "active" ? "leave" : "active" }
        : member
    );
    setTeam(updated);
  };

  const handleViewAllLeads = () => {
    navigate('/admin/all-leads');
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/recordings")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        >
          <span>📞</span> Call Analysis
        </button>
        <button
          onClick={handleViewAllLeads}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        >
          <span>👥</span> View All Leads
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        {team.map((member) => (
          <TeamCard
            key={member.email}
            member={member}
            onClick={() => navigate(`/leads/${encodeURIComponent(member.email)}`)}
            toggleStatus={toggleStatus}
          />
        ))}
      </div>
    </div>
  );
}
