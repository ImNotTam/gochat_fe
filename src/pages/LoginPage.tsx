import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import Toast from '../components/common/Toast';
import './Auth.css';

const LoginPage = () => {
  const { user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>Chat App</h1>
          <p>Trao đổi trực tuyến với bạn bè và đồng nghiệp</p>
        </div>
        {error && <Toast message={error} onClose={clearError} />}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
