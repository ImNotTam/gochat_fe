import { useAuth } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import RoomList from '../components/chat/RoomList';
import ChatRoom from '../components/chat/ChatRoom';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <ChatProvider>
      <div className="chat-page">
        <header className="chat-header">
          <div className="app-logo">Chat App</div>
          <div className="user-info">
            <div className="user-name">
              <FaUser className="user-icon" />
              <span>{user?.username}</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </header>
        
        <main className="chat-content">
          <RoomList />
          <ChatRoom />
        </main>
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
