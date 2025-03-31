import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { FaUsers, FaComments } from 'react-icons/fa';
import './Chat.css';

const ChatRoom: React.FC = () => {
  const { currentRoom, messages, sendMessage, error, loading, connected } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return (
      <div className="chat-room empty-room">
        <div className="select-room-message">
          <FaUsers className="select-room-icon" />
          <h3>Chọn một phòng chat để bắt đầu</h3>
          <p>Hoặc tạo phòng mới từ danh sách bên trái</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <h3>{currentRoom.name}</h3>
        <div className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          {connected ? 'Đã kết nối' : 'Mất kết nối'}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message">
          <div>Đang tải tin nhắn...</div>
        </div>
      ) : (
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <FaComments className="no-messages-icon" />
              <h3>Chưa có tin nhắn nào</h3>
              <p>Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}
      
      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={!connected || loading}
        placeholder={!connected ? 'Đang kết nối lại...' : 'Nhập tin nhắn...'}
      />
    </div>
  );
};

export default ChatRoom;
