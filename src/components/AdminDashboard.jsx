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
  const navigate = useNavigate(); // Add this

  const toggleStatus = (email) => {
    const updated = team.map((member) =>
      member.email === email
        ? { ...member, status: member.status === "active" ? "leave" : "active" }
        : member
    );
    setTeam(updated);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "30px" }}>
      {team.map((member) => (
        <TeamCard
          key={member.email}
          member={member}
          onClick={() => navigate(`/leads/${encodeURIComponent(member.email)}`)}
          toggleStatus={toggleStatus}
        />
      ))}
    </div>
  );
}
