import React from 'react';
import { useSubscription } from '@apollo/client';
import { MESSAGE_SUBSCRIPTION, NOTIFICATION_SUBSCRIPTION } from '../../graphql/operations';
import './Common.css';

const RealtimeStatus = () => {
  const { data: messageData, error: messageError } = useSubscription(MESSAGE_SUBSCRIPTION);
  const { data: notificationData, error: notificationError } = useSubscription(NOTIFICATION_SUBSCRIPTION);

  const getConnectionStatus = (data, error) => {
    if (error) return 'error';
    if (data) return 'connected';
    return 'connecting';
  };

  const messageStatus = getConnectionStatus(messageData, messageError);
  const notificationStatus = getConnectionStatus(notificationData, notificationError);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'error':
        return '❌';
      case 'connecting':
      default:
        return '🔄';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'connecting':
      default:
        return 'Connecting...';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'connected':
        return 'connected';
      case 'error':
        return 'error';
      case 'connecting':
      default:
        return 'connecting';
    }
  };

  return (
    <div className="realtime-status">
      <h4>📡 Real-time Connection Status</h4>
      <div className="status-grid">
        <div className={`status-item ${getStatusClass(messageStatus)}`}>
          <span className="status-icon">{getStatusIcon(messageStatus)}</span>
          <div className="status-info">
            <span className="status-label">Messages</span>
            <span className="status-text">{getStatusText(messageStatus)}</span>
          </div>
        </div>
        
        <div className={`status-item ${getStatusClass(notificationStatus)}`}>
          <span className="status-icon">{getStatusIcon(notificationStatus)}</span>
          <div className="status-info">
            <span className="status-label">Notifications</span>
            <span className="status-text">{getStatusText(notificationStatus)}</span>
          </div>
        </div>
      </div>

      {(messageError || notificationError) && (
        <div className="connection-errors">
          <h5>Connection Issues:</h5>
          {messageError && (
            <p className="error-detail">Messages: {messageError.message}</p>
          )}
          {notificationError && (
            <p className="error-detail">Notifications: {notificationError.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeStatus;