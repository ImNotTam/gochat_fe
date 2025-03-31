import React, { createContext, useContext, useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import * as chatApi from '../api/chat';
import { Room, Message } from '../types/chat';
import { useAuth } from './AuthContext';

interface ChatContextType {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  unreadMessages: { [roomId: number]: number };
  joinRoom: (roomId: string) => Promise<void>;
  sendMessage: (content: string, fileUrl?: string, fileType?: string) => void;
  createRoom: (name: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<{ [roomId: number]: number }>({});
  
  const { user } = useAuth();
  const { lastMessage, error: wsError, connect, sendMessage: wsSendMessage } = useWebSocket();

  // Load rooms and establish connections when user logs in
  useEffect(() => {
    const loadRoomsAndConnect = async () => {
      if (!user) {
        setRooms([]);
        setCurrentRoom(null);
        setMessages([]);
        return;
      }
      
      try {
        setLoading(true);
        const roomsData = await chatApi.getRooms();
        console.log('Loaded rooms:', roomsData);
        setRooms(roomsData);

        // Establish connections for all rooms
        roomsData.forEach(room => {
          connect(room.id.toString(), user.id.toString(), user.username);
        });

      } catch (err) {
        console.error('Error loading rooms:', err);
        setError('Không thể tải danh sách phòng chat');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoomsAndConnect();
  }, [user?.id]); // Depend on user.id instead of user object

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage && user) {
      const roomId = lastMessage.roomId;
      
      // Nếu đang ở phòng chat này, hiển thị tin nhắn mới ngay lập tức
      if (currentRoom && roomId === currentRoom.id) {
        setMessages(prev => [...prev, lastMessage]);
      } else {
        // Chỉ tăng thông báo nếu tin nhắn không phải từ người dùng hiện tại
        if (lastMessage.username !== user.username) {
          setUnreadMessages(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1
          }));
        }
      }
    }
  }, [lastMessage, currentRoom, user]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      setError(wsError);
    }
  }, [wsError]);

  const joinRoom = async (roomId: string) => {
    try {
      // If we're already in this room, do nothing
      if (currentRoom?.id === Number(roomId)) {
        return;
      }

      setLoading(true);
      setError(null);
      
      // Xóa tin nhắn hiện tại trước khi load phòng mới
      setMessages([]);
      
      const roomIdNum = Number(roomId);
      console.log('Switching to room:', roomIdNum);
      
      // Find room from the list
      const room = rooms.find(r => r.id === roomIdNum);
      
      // Load messages for this room
      const roomMessages = await chatApi.getMessages(roomId);
      
      // Update UI state - if roomMessages is null, use empty array
      setCurrentRoom(room || null);
      setMessages(roomMessages || []);
      
      // Reset unread count for this room
      setUnreadMessages(prev => ({
        ...prev,
        [roomIdNum]: 0
      }));
      
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Không thể tham gia phòng chat. Vui lòng thử lại.');
      setCurrentRoom(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (content: string, fileUrl?: string, fileType?: string) => {
    if (!currentRoom) {
      setError('Vui lòng chọn một phòng chat trước khi gửi tin nhắn');
      return;
    }

    if (!user) {
      setError('Vui lòng đăng nhập để gửi tin nhắn');
      return;
    }

    // Chỉ kiểm tra nội dung trống nếu không có file đính kèm
    if (!content.trim() && !fileUrl) {
      return;
    }

    try {
      wsSendMessage(currentRoom.id.toString(), content, fileUrl, fileType);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const createRoom = async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const newRoom = await chatApi.createRoom(name);
      console.log('New room created:', newRoom);
      
      // Add new room to the list
      setRooms(prev => [...prev, newRoom]);
      
      // Establish connection for the new room
      if (user) {
        connect(newRoom.id.toString(), user.id.toString(), user.username);
      }
      
      // Join the new room immediately
      await joinRoom(newRoom.id.toString());
      
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Không thể tạo phòng chat. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      await chatApi.deleteRoom(roomId);
      const roomIdNum = Number(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomIdNum));
      if (currentRoom?.id === roomIdNum) {
        setCurrentRoom(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to delete room');
      console.error(err);
    }
  };

  return (
    <ChatContext.Provider value={{
      rooms,
      currentRoom,
      messages,
      loading,
      error,
      connected: !!currentRoom,
      unreadMessages,
      joinRoom,
      sendMessage,
      createRoom,
      deleteRoom
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
