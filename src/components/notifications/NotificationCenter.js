import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  MY_NOTIFICATIONS, 
  CREATE_NOTIFICATION, 
  MARK_NOTIFICATION_READ,
  DELETE_NOTIFICATION,
  NOTIFICATION_SUBSCRIPTION 
} from '../../graphql/operations';
import { useAuth } from '../../contexts/AuthContext';
import NotificationItem from './NotificationItem';
import CreateNotificationForm from './CreateNotificationForm';
import './Notifications.css';

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();

  const { data: notificationsData, loading, refetch } = useQuery(MY_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network'
  });

  const { data: newNotification } = useSubscription(NOTIFICATION_SUBSCRIPTION);

  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => refetch(),
    onError: (error) => console.error('Error marking notification as read:', error)
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => refetch(),
    onError: (error) => console.error('Error deleting notification:', error)
  });

  // Refetch when new notification arrives
  useEffect(() => {
    if (newNotification) {
      refetch();
    }
  }, [newNotification, refetch]);

  const notifications = notificationsData?.myNotifications || [];
  
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId) => {
    markAsRead({
      variables: { id: parseFloat(notificationId) }
    });
  };

  const handleDelete = (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotification({
        variables: { id: parseFloat(notificationId) }
      });
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    unreadNotifications.forEach(notification => {
      markAsRead({
        variables: { id: parseFloat(notification.id) }
      });
    });
  };

  if (loading) {
    return (
      <div className="notification-center">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <div className="header-left">
          <h2>🔔 Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          <button 
            className="create-notification-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            title="Create notification"
          >
            ➕ Create
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateNotificationForm
          currentUser={user}
          onNotificationCreated={() => {
            setShowCreateForm(false);
            refetch();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="notification-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            {filter === 'all' ? (
              <div>
                <p>No notifications yet</p>
                <button 
                  className="create-first-notification"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create your first notification
                </button>
              </div>
            ) : (
              <p>No {filter} notifications</p>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Live notification indicator */}
      {newNotification && (
        <div className="live-notification-alert">
          <div className="alert-content">
            <span className="alert-icon">🔴</span>
            <div className="alert-text">
              <strong>New notification received!</strong>
              <p>{newNotification.notificationAdded.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;