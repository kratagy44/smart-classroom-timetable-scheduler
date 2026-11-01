// Shows the page only if the user is logged in (and has the right role).
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />; // not logged in
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />; // wrong role

  return children;
}
