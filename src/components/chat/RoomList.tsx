import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { FaPlus, FaComments, FaTrash } from 'react-icons/fa';
import './Chat.css';

const RoomList = () => {
  const { rooms, currentRoom, unreadMessages, joinRoom, createRoom, deleteRoom, loading } = useChat();
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || loading) return;

    try {
      await createRoom(newRoomName);
      setNewRoomName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation(); // Prevent room selection when clicking delete
    if (loading) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await deleteRoom(roomId.toString());
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleRoomClick = (roomId: number) => {
    console.log('Room clicked:', roomId);
    joinRoom(roomId.toString());
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Phòng chat</h3>
        <button 
          className="create-room-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Tạo phòng mới"
        >
          <FaPlus />
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Tên phòng mới"
            required
          />
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo phòng'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowCreateForm(false)}
              className="cancel-button"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="room-items">
        {rooms.length === 0 ? (
          <div className="no-rooms">
            <FaComments className="no-rooms-icon" />
            <p>Chưa có phòng chat nào</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="create-first-room"
            >
              Tạo phòng đầu tiên
            </button>
          </div>
        ) : (
          <div className="room-list-items">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => handleRoomClick(room.id)}
              >
                <div className="room-icon">
                  <FaComments />
                </div>
                <div className="room-details">
                  <div className="room-name">{room.name}</div>
                  {unreadMessages[room.id] > 0 && (
                    <div className="unread-count">{unreadMessages[room.id]}</div>
                  )}
                </div>
                <button
                  className="delete-room-button"
                  onClick={(e) => handleDeleteRoom(e, room.id)}
                  title="Xóa phòng"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
