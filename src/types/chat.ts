export interface Room {
    id: number;
    name: string;
  }
  
  export interface Client {
    id: string;
    username: string;
  }
  
  export interface Message {
    id: number;
    content: string;
    roomId: number;
    username: string;
    fileUrl?: string;
    fileType?: string;
    createdAt: string;
    updatedAt: string;
    file_url?: string;
    file_type?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface MessageInput {
    content: string;
    file_url?: string;
    file_type?: string;
  }
  