import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard({ email }) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("UserDashboard mounted with email:", email);

    setTimeout(() => {
      navigate("/home", { replace: true }); // ✅ go to actual dashboard
    }, 100);
  }, [email]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500 text-xl">
      Redirecting to your dashboard...
    </div>
  );
}
