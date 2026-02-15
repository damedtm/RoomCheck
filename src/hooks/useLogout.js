// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    
    navigate('/login', { replace: true });
  };

  return handleLogout;
}