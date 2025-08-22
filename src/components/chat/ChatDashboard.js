import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { MY_ROOMS, CREATE_ROOM, MESSAGE_SUBSCRIPTION } from '../../graphql/operations';
import { useAuth } from '../../contexts/AuthContext';
import ChatRoom from './ChatRoom';
import CreateRoomModal from './CreateRoomModal';
import './Chat.css';

const ChatDashboard = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const { data: roomsData, loading, refetch } = useQuery(MY_ROOMS);
  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION);

  // Refetch rooms when component mounts to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handle new messages - could add notification sound here
  useEffect(() => {
    if (newMessage) {
      // You could add a notification sound or visual indicator here
      console.log('New message received:', newMessage.messageAdded);
    }
  }, [newMessage]);

  const rooms = roomsData?.myRooms || [];
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoom = rooms.find(room => room.id === selectedRoomId);

  const handleRoomCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
  };

  if (loading) {
    return (
      <div className="chat-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your chat rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-dashboard">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Chat Rooms</h2>
          <button 
            className="create-room-btn"
            onClick={() => setShowCreateModal(true)}
            title="Create new room"
          >
            ➕
          </button>
        </div>

        <div className="room-search">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="rooms-list">
          {filteredRooms.length === 0 ? (
            <div className="empty-rooms">
              {searchTerm ? (
                <p>No rooms match your search</p>
              ) : (
                <div>
                  <p>No chat rooms yet</p>
                  <button 
                    className="create-first-room"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create your first room
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`room-item ${selectedRoomId === room.id ? 'active' : ''}`}
                onClick={() => handleRoomSelect(room.id)}
              >
                <div className="room-info">
                  <h4>{room.name}</h4>
                  <p>{room.participants?.length || 0} participants</p>
                </div>
                {newMessage?.messageAdded?.roomId === room.id && selectedRoomId !== room.id && (
                  <div className="new-message-indicator">●</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedRoom ? (
          <ChatRoom 
            room={selectedRoom} 
            currentUser={user}
          />
        ) : (
          <div className="no-room-selected">
            <div className="welcome-message">
              <h3>Welcome to Chat! 👋</h3>
              <p>Select a room from the sidebar to start chatting</p>
              {rooms.length === 0 && (
                <button 
                  className="create-room-cta"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Room
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default ChatDashboard;