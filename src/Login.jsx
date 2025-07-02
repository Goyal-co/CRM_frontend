import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
  const decoded = jwtDecode(credentialResponse.credential);
  const email = decoded.email;
  localStorage.setItem("email", email); // ✅ This must match login email
  navigate("/user");

  if (email === "pratham.goyalhariyana@gmail.com" || email === "avularudrasekharreddy@gmail.com") {
    navigate("/admin");
  } else {
    navigate("/user");
  }
};

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8f9fa" }}>
      <div style={{
  backgroundColor: "white",
  padding: "80px 60px",
  borderRadius: "32px",
  boxShadow: "0 15px 60px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "600px",     // ⬅️ significantly wider
  textAlign: "center",
  transform: "scale(1.05)",  // ⬅️ slight zoom effect
}}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "24px", color: "#111827" }}>Titans</h1>
        <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Login Failed")} />
      </div>
    </div>
  );
}
