import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types/chat';

const WEBSOCKET_URL = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8080';

const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const socketsRef = useRef<{ [roomId: string]: WebSocket }>({});
  const reconnectTimeoutsRef = useRef<{ [roomId: string]: number }>({});
  const reconnectAttemptsRef = useRef<{ [roomId: string]: number }>({});
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback((roomId: string, userId: string, username: string) => {
    // If connection already exists for this room, don't create a new one
    if (socketsRef.current[roomId] && socketsRef.current[roomId].readyState === WebSocket.OPEN) {
      console.log('WebSocket connection already exists for room:', roomId);
      return;
    }

    const wsUrl = `${WEBSOCKET_URL}/ws/joinRoom/${roomId}?userId=${userId}&username=${username}`;
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      const socket = new WebSocket(wsUrl);
      socketsRef.current[roomId] = socket;

      socket.onopen = () => {
        console.log('WebSocket connected to room:', roomId);
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current[roomId] = 0;
      };

      socket.onmessage = (event) => {
        try {
          console.log('WebSocket received message in room:', roomId, event.data);
          const message = JSON.parse(event.data) as Message;
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setError('Lỗi khi xử lý tin nhắn từ server');
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected from room:', roomId, 'Code:', event.code, 'Reason:', event.reason);
        
        // Only attempt to reconnect if we haven't exceeded max attempts
        if (!reconnectAttemptsRef.current[roomId]) {
          reconnectAttemptsRef.current[roomId] = 0;
        }
        
        if (reconnectAttemptsRef.current[roomId] < MAX_RECONNECT_ATTEMPTS) {
          setError('Mất kết nối với phòng chat. Đang thử kết nối lại...');
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current[roomId]), 10000);
          reconnectTimeoutsRef.current[roomId] = window.setTimeout(() => {
            console.log('Attempting to reconnect to room:', roomId, 'Attempt:', reconnectAttemptsRef.current[roomId] + 1);
            reconnectAttemptsRef.current[roomId] += 1;
            if (roomId && userId && username) {
              connect(roomId, userId, username);
            }
          }, delay);
        } else {
          setError('Không thể kết nối lại với phòng chat. Vui lòng tải lại trang.');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error for room:', roomId, error);
        setError('Có lỗi kết nối đến phòng chat');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setError('Không thể kết nối đến phòng chat');
    }
  }, []);

  const sendMessage = useCallback((roomId: string, content: string, fileUrl?: string, fileType?: string) => {
    // Get the socket for the specific room
    const socket = socketsRef.current[roomId];

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error('No active WebSocket connection for room:', roomId);
      setError('Không thể gửi tin nhắn. Đang thử kết nối lại...');
      return false;
    }

    try {
      const message = {
        content,
        file_url: fileUrl || '',
        file_type: fileType || ''
      };
      socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Không thể gửi tin nhắn');
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Close all WebSocket connections
      Object.values(socketsRef.current).forEach(socket => {
        if (socket) {
          socket.close();
        }
      });
      
      // Clear all reconnect timeouts
      Object.values(reconnectTimeoutsRef.current).forEach(timeout => {
        if (timeout) {
          clearTimeout(timeout);
        }
      });
    };
  }, []);

  return {
    connected,
    error,
    lastMessage,
    connect,
    sendMessage
  };
};

export default useWebSocket;
