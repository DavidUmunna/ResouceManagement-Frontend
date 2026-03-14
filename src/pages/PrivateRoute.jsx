import { Navigate } from "react-router-dom";
import { useUser } from "../components/usercontext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/adminlogin" />;
}

