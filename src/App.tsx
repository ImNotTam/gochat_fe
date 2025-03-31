import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import './App.css';

// Component để xử lý chuyển hướng dựa vào trạng thái đăng nhập
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading trong khi kiểm tra xác thực
  if (loading) {
    return <div className="app-loading">Đang tải...</div>;
  }

  return (
    <Routes>
      {/* Nếu đã đăng nhập, chuyển hướng các trang công khai về chat */}
      {user ? (
        <>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<Navigate to="/chat" replace />} />
          <Route path="/register" element={<Navigate to="/chat" replace />} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </>
      ) : (
        /* Nếu chưa đăng nhập, chỉ cho phép truy cập các trang công khai */
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/chat" element={<Navigate to="/login" replace state={{ from: location }} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
