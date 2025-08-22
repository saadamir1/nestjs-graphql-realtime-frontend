import React from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { Link } from 'react-router-dom';
import { MY_NOTIFICATIONS, MY_ROOMS, MESSAGE_SUBSCRIPTION, NOTIFICATION_SUBSCRIPTION } from '../../graphql/operations';
import { useAuth } from '../../contexts/AuthContext';
import RealtimeStatus from '../common/RealtimeStatus';
import './Dashboard.css';

const DashboardOverview = () => {
  const { user } = useAuth();
  const { data: notifications } = useQuery(MY_NOTIFICATIONS);
  const { data: rooms } = useQuery(MY_ROOMS);
  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION);
  const { data: newNotification } = useSubscription(NOTIFICATION_SUBSCRIPTION);

  const unreadNotifications = notifications?.myNotifications?.filter(n => !n.read) || [];
  const totalRooms = rooms?.myRooms?.length || 0;

  return (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h2>Welcome back, {user?.firstName}! 👋</h2>
        <p className="welcome-subtitle">
          Here's what's happening in your dashboard today.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{unreadNotifications.length}</h3>
            <p>Unread Notifications</p>
            <Link to="/dashboard/notifications" className="stat-link">
              View all →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{totalRooms}</h3>
            <p>Chat Rooms</p>
            <Link to="/dashboard/chat" className="stat-link">
              Open chat →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{user?.role}</h3>
            <p>Account Type</p>
            <Link to="/dashboard/profile" className="stat-link">
              View profile →
            </Link>
          </div>
        </div>
      </div>

      <div className="overview-sections">
        <div className="overview-section">
          <h3>📡 Real-time Status</h3>
          <RealtimeStatus />
        </div>

        <div className="overview-section">
          <h3>🔔 Recent Notifications</h3>
          <div className="recent-notifications">
            {unreadNotifications.length === 0 ? (
              <p className="empty-state">No unread notifications</p>
            ) : (
              unreadNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="notification-preview">
                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              ))
            )}
            {unreadNotifications.length > 3 && (
              <Link to="/dashboard/notifications" className="view-more">
                View {unreadNotifications.length - 3} more notifications →
              </Link>
            )}
          </div>
        </div>

        <div className="overview-section">
          <h3>💬 Chat Rooms</h3>
          <div className="recent-rooms">
            {totalRooms === 0 ? (
              <p className="empty-state">No chat rooms yet</p>
            ) : (
              rooms.myRooms.slice(0, 3).map((room) => (
                <div key={room.id} className="room-preview">
                  <div className="room-info">
                    <strong>{room.name}</strong>
                    <p>{room.participants?.length || 0} participants</p>
                  </div>
                </div>
              ))
            )}
            {totalRooms > 3 && (
              <Link to="/dashboard/chat" className="view-more">
                View {totalRooms - 3} more rooms →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Live Updates */}
      {newNotification && (
        <div className="live-update notification-update">
          <h4>🔴 New Notification</h4>
          <div className="update-content">
            <strong>{newNotification.notificationAdded.title}</strong>
            <p>{newNotification.notificationAdded.message}</p>
          </div>
        </div>
      )}

      {newMessage && (
        <div className="live-update message-update">
          <h4>🔴 New Message</h4>
          <div className="update-content">
            <strong>Room {newMessage.messageAdded.roomId}</strong>
            <p>{newMessage.messageAdded.content}</p>
            <small>From {newMessage.messageAdded.sender?.firstName} {newMessage.messageAdded.sender?.lastName}</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;