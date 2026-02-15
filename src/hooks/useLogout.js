// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // replace: true removes dashboard from history
    // back button cannot return to the dashboard after logout
    navigate('/login', { replace: true });
  };

  return handleLogout;
}