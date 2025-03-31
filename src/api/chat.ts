import api from './axios';
import { Room, Message } from '../types/chat';

export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>('/ws/rooms');
  return response.data;
};

export const createRoom = async (name: string): Promise<Room> => {
  console.log('Creating room with name:', name);
  try {
    const response = await api.post<Room>('/ws/createRoom', { name });
    console.log('Room created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await api.delete(`/ws/rooms/${roomId}`);
};

export const getMessages = async (roomId: string): Promise<Message[]> => {
  const response = await api.get<Message[]>(`/ws/messages/${roomId}`);
  return response.data;
};

export const getClients = async (roomId: string): Promise<string[]> => {
  const response = await api.get<string[]>(`/ws/getClients/${roomId}`);
  return response.data;
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{url: string}>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};
