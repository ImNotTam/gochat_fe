import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import './Auth.css';

const RegisterPage = () => {
  const { user, loading } = useAuth();
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
          <p>Tạo tài khoản để bắt đầu trò chuyện</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
