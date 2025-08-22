import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { ROOM_MESSAGES, SEND_MESSAGE, MESSAGE_SUBSCRIPTION } from '../../graphql/operations';
import './Chat.css';

const ChatRoom = ({ room, currentUser }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const { data: messagesData, loading, refetch } = useQuery(ROOM_MESSAGES, {
    variables: { roomId: parseFloat(room.id) },
    fetchPolicy: 'cache-and-network'
  });

  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION);

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setMessage('');
      refetch();
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  // Refetch messages when new message arrives for this room
  useEffect(() => {
    if (newMessage?.messageAdded?.roomId === parseInt(room.id)) {
      refetch();
    }
  }, [newMessage, room.id, refetch]);

  // Focus input when room changes
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [room.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    sendMessage({
      variables: {
        content: message.trim(),
        roomId: parseFloat(room.id)
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const messages = messagesData?.roomMessages || [];

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="room-info">
          <h3>{room.name}</h3>
          <p>{room.participants?.length || 0} participants</p>
        </div>
        <div className="room-participants">
          {room.participants?.map((participant, index) => (
            <span key={participant.id} className="participant-badge">
              {participant.firstName} {participant.lastName}
              {index < room.participants.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation! 💬</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === parseInt(currentUser.id);
              const showSender = index === 0 || messages[index - 1].senderId !== msg.senderId;
              
              return (
                <div
                  key={msg.id}
                  className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {showSender && !isOwnMessage && (
                    <div className="message-sender">
                      {msg.sender?.firstName} {msg.sender?.lastName}
                    </div>
                  )}
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <div className="message-input-container">
          <textarea
            ref={messageInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            rows="1"
            disabled={sending}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!message.trim() || sending}
            title="Send message (Enter)"
          >
            {sending ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;