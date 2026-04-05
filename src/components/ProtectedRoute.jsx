import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const roleName = user.role?.name || user.role || '';
    const isAdminOrMod = roleName === 'ADMIN' || roleName === 'MODERATOR' || roleName === 'MOD';
    if (!isAdminOrMod) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
