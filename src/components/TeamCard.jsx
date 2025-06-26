export default function TeamCard({ member, onClick, toggleStatus }) {
    return (
      <div style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "20px",
        width: "300px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h3>{member.name}</h3>
        <p>{member.email}</p>
        <p>{member.designation}</p>
  
        <label>
          <input
            type="checkbox"
            checked={member.status === "active"}
            onChange={() => toggleStatus(member.email)}
          />
          {member.status === "active" ? " Active" : " Leave"}
        </label>
  
        <br /><br />
        <button onClick={() => onClick(member.email)}>View Leads</button>
      </div>
    );
  }
  