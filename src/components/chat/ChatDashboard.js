import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  MY_ROOMS,
  CREATE_ROOM,
  MESSAGE_SUBSCRIPTION,
  USERS_QUERY,
} from "../../graphql/operations";
import { useAuth } from "../../contexts/AuthContext";
import ChatRoom from "./ChatRoom";
import CreateRoomModal from "./CreateRoomModal";
import "./Chat.css";

const ChatDashboard = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { user, loading: authLoading, error: authError } = useAuth();
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY);
  const {
    data: roomsData,
    loading: roomsLoading,
    refetch,
  } = useQuery(MY_ROOMS);
  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION);
  const [unreadRoomIds, setUnreadRoomIds] = useState([]);
  const [createRoom] = useMutation(CREATE_ROOM);

  // Refetch rooms when component mounts to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handle new messages - could add notification sound here
  useEffect(() => {
    if (newMessage) {
      // Notification sound or visual indicator
      const msg = newMessage.messageAdded;
      // If the message is for a room not currently selected, mark as unread
      if (msg && msg.roomId !== selectedRoomId) {
        setUnreadRoomIds((prev) =>
          prev.includes(msg.roomId) ? prev : [...prev, msg.roomId]
        );
      }
      // Always refetch rooms to update sidebar
      refetch();
    }
  }, [newMessage, selectedRoomId, refetch]);

  const rooms = roomsData?.myRooms || [];
  const users = (usersData?.users || []).filter((u) => u.id !== user?.id);
  const [userSearch, setUserSearch] = useState("");
  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const handleRoomCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    // Mark room as read
    setUnreadRoomIds((prev) => prev.filter((id) => id !== roomId));
  };

  if (authLoading || roomsLoading || usersLoading) {
    return (
      <div className="chat-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="chat-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Authentication error: {authError.message}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="chat-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading user info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-dashboard">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Direct Messages</h2>
        </div>
        <div className="room-search">
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="rooms-list">
          {filteredUsers.length === 0 ? (
            <div className="empty-rooms">
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              if (!user) return null;
              // Find if a room exists with just these two users
              const privateRoom = rooms.find(
                (r) =>
                  r.participants.length === 2 &&
                  r.participants.some((p) => p.id === u.id) &&
                  r.participants.some((p) => p.id === user.id)
              );
              const hasNewMessage =
                newMessage?.messageAdded?.roomId === privateRoom?.id &&
                selectedRoomId !== privateRoom?.id;
              return (
                <div
                  key={u.id}
                  className={`room-item ${
                    selectedRoomId === privateRoom?.id ? "active" : ""
                  }`}
                  onClick={async () => {
                    if (!user) return;
                    if (privateRoom) {
                      handleRoomSelect(privateRoom.id);
                    } else {
                      // Create a new private room
                      const res = await createRoom({
                        variables: {
                          name: `${user.firstName} & ${u.firstName}`,
                          participantIds: [parseInt(user.id), parseInt(u.id)],
                        },
                      });
                      const newRoomId = res.data.createRoom.id;
                      refetch();
                      handleRoomSelect(newRoomId);
                    }
                  }}
                >
                  <div className="room-info">
                    <h4>
                      {u.firstName} {u.lastName}
                    </h4>
                    <p>{u.email}</p>
                  </div>
                  {(hasNewMessage ||
                    (privateRoom &&
                      unreadRoomIds.includes(privateRoom.id))) && (
                    <div className="new-message-indicator">●</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedRoom ? (
          <ChatRoom room={selectedRoom} currentUser={user} />
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
