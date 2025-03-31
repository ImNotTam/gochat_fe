import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import * as chatApi from '../../api/chat';
import './Chat.css';

interface ChatInputProps {
  onSendMessage: (content: string, fileUrl?: string, fileType?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Nhập tin nhắn...'
}) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || uploading) return;

    onSendMessage(message);
    setMessage('');
  };

  const getFileType = (fileType: string): string => {
    const type = fileType.split('/')[0];
    if (['image', 'video', 'audio'].includes(type)) {
      return type;
    }
    // Xác định loại file cụ thể
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'doc';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'ppt';
    return 'file';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Thêm thiết lập không gian để hiển thị progress
      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 200);

      const fileUrl = await chatApi.uploadFile(file);
      const fileType = getFileType(file.type);
      
      clearInterval(simulateProgress);
      setUploadProgress(100);
      
      // Thêm nhỏ delay để hiển thị hoàn thành
      setTimeout(() => {
        // Gửi tên file trong nội dung tin nhắn
        onSendMessage(file.name, fileUrl, fileType);
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      setUploadProgress(0);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      {uploading && (
        <div className="upload-progress">
          <div className="upload-progress-bar">
            <div 
              className="upload-progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="upload-progress-text">
            {uploadProgress < 100 ? 'Đang tải file lên...' : 'Hoàn thành!'}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={uploading ? 'Đang tải file lên...' : placeholder}
          disabled={disabled || uploading}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="attach-button"
          title="Đính kèm file"
        >
          <FaPaperclip />
        </button>
        <button 
          type="submit" 
          disabled={!message.trim() || disabled || uploading}
          className="send-button"
          title="Gửi tin nhắn"
        >
          <FaPaperPlane />
        </button>
      </form>
    </>
  );
};

export default ChatInput;
