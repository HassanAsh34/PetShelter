import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is activated
  if (user?.activated === 0) {
    return (
      <div>
        Your account is currently inactive. Please contact support for assistance.
      </div>
    );
  }

  // Check if user is banned
  if (user?.activated === 2) {
    return (
      <div>
        Your account has been suspended. Please contact support for assistance.
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute; 