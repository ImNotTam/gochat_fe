import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types/chat';
import { formatTime } from '../../utils/formatTime';
import './Chat.css';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { user } = useAuth();
  const isOwnMessage = user?.username === message.username;
  
  // Lấy URL file từ cả file_url hoặc fileUrl
  const getFileUrl = () => {
    // @ts-ignore - Bỏ qua lỗi typescript vì chúng ta đang kiểm tra động
    return message.fileUrl || message.file_url || null;
  };
  
  // Lấy loại file từ cả file_type hoặc fileType
  const getFileType = () => {
    // @ts-ignore - Bỏ qua lỗi typescript vì chúng ta đang kiểm tra động
    return message.fileType || message.file_type || null;
  };
  
  const renderAttachment = () => {
    const fileUrl = getFileUrl();
    const fileType = getFileType();
    
    if (!fileUrl) return null;
    
    console.log('Rendering attachment:', { fileUrl, fileType, message });
    
    switch (fileType) {
      case 'image':
        return (
          <div className="message-attachment">
            <img 
              src={fileUrl} 
              alt="Image attachment" 
              className="message-image"
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
        );
      case 'video':
        return (
          <div className="message-attachment">
            <video 
              src={fileUrl} 
              controls 
              className="message-video"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="message-attachment">
            <audio 
              src={fileUrl} 
              controls 
              className="message-audio"
            />
          </div>
        );
      default:
        return (
          <div className="message-attachment">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="message-file"
            >
              <div className="file-icon">📄</div>
              <span>{message.content || 'Tải xuống tập tin'}</span>
            </a>
          </div>
        );
    }
  };
  
  return (
    <div className={`message-container ${isOwnMessage ? 'own-message' : ''}`}>
      {!isOwnMessage && (
        <div className="message-sender">{message.username}</div>
      )}
      
      <div className="message-content">
        {message.content && !getFileUrl() && (
          <div className="message-text">{message.content}</div>
        )}
        
        {renderAttachment()}
        
        <div className="message-time">
          {formatTime(message.createdAt || message.created_at || '')}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
