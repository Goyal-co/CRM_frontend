import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoLoader from './components/VideoLoader';

export default function UserDashboard({ email }) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("UserDashboard mounted with email:", email);

    setTimeout(() => {
      navigate("/home", { replace: true }); // ✅ go to actual dashboard
    }, 100);
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-100">
      <VideoLoader 
        message="Redirecting to your dashboard..." 
        size="large"
        className="min-h-screen"
      />
    </div>
  );
}
