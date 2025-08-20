import React, { useState } from 'react';
import { ApolloProvider, gql, useMutation, useSubscription, useQuery } from '@apollo/client';
import client from './apollo-client';
import './App.css';

// GraphQL mutations and subscriptions
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      access_token
      refresh_token
    }
  }
`;

const BOOTSTRAP_ADMIN = gql`
  mutation BootstrapAdmin($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    bootstrapAdmin(bootstrapInput: {
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    }) {
      access_token
      refresh_token
    }
  }
`;

const GET_ME = gql`
  query {
    me {
      id
      email
      firstName
      lastName
      role
    }
  }
`;

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($title: String!, $message: String!, $type: String!, $userId: Float!) {
    createNotification(createNotificationInput: {
      title: $title
      message: $message
      type: $type
      userId: $userId
    }) {
      id
      title
      message
    }
  }
`;

const MY_NOTIFICATIONS = gql`
  query {
    myNotifications {
      id
      title
      message
      type
      read
      createdAt
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription {
    messageAdded {
      id
      content
      senderId
      roomId
      createdAt
    }
  }
`;

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription {
    notificationAdded {
      id
      title
      message
      type
      userId
      read
      createdAt
    }
  }
`;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isBootstrap, setIsBootstrap] = useState(false);

  const getErrorMessage = (error) => {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }
    return error.message;
  };

  const [login] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('access_token', data.login.access_token);
      localStorage.setItem('refresh_token', data.login.refresh_token);
      window.location.reload(); // Refresh to update login state
    },
    onError: (error) => {
      console.error('Login error:', error);
      alert('Login failed: ' + getErrorMessage(error));
    }
  });

  const [bootstrapAdmin] = useMutation(BOOTSTRAP_ADMIN, {
    onCompleted: (data) => {
      localStorage.setItem('access_token', data.bootstrapAdmin.access_token);
      localStorage.setItem('refresh_token', data.bootstrapAdmin.refresh_token);
      window.location.reload(); // Refresh to update login state
    },
    onError: (error) => {
      console.error('Bootstrap error:', error);
      alert('Bootstrap failed: ' + getErrorMessage(error));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBootstrap) {
      bootstrapAdmin({
        variables: { email, password, firstName, lastName }
      });
    } else {
      login({
        variables: { email, password }
      });
    }
  };

  return (
    <div className="login-form">
      <h2>{isBootstrap ? 'Bootstrap Admin' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isBootstrap && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </>
        )}
        <button type="submit">
          {isBootstrap ? 'Bootstrap Admin' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsBootstrap(!isBootstrap)}>
        Switch to {isBootstrap ? 'Login' : 'Bootstrap Admin'}
      </button>
    </div>
  );
}

function NotificationCenter() {
  const { data: userData } = useQuery(GET_ME);
  const { data: notifications, refetch } = useQuery(MY_NOTIFICATIONS);
  const { data: newNotification } = useSubscription(NOTIFICATION_SUBSCRIPTION);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const [createNotification] = useMutation(CREATE_NOTIFICATION, {
    onCompleted: () => {
      setTitle('');
      setMessage('');
      refetch();
    }
  });

  // Refetch notifications when new one arrives
  React.useEffect(() => {
    if (newNotification) {
      refetch();
    }
  }, [newNotification, refetch]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!userData?.me?.id || !title || !message) return;
    
    createNotification({
      variables: {
        title,
        message,
        type: 'info',
        userId: parseInt(userData.me.id)
      }
    });
  };

  return (
    <div className="notification-center">
      <h3>🔔 Notification Center</h3>
      
      <div className="create-notification">
        <h4>Create Notification</h4>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit">Send Notification</button>
        </form>
      </div>

      <div className="notifications-list">
        <h4>My Notifications</h4>
        {notifications?.myNotifications?.map((notif) => (
          <div key={notif.id} className={`notification ${!notif.read ? 'unread' : ''}`}>
            <strong>{notif.title}</strong>
            <p>{notif.message}</p>
            <small>{new Date(notif.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {newNotification && (
        <div className="live-notification">
          <h4>🔴 Live Notification Received:</h4>
          <div className="notification new">
            <strong>{newNotification.notificationAdded.title}</strong>
            <p>{newNotification.notificationAdded.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RealtimeStatus() {
  const { data: messageData } = useSubscription(MESSAGE_SUBSCRIPTION);
  const { data: notificationData } = useSubscription(NOTIFICATION_SUBSCRIPTION);

  return (
    <div className="realtime-status">
      <h4>📡 Real-time Connection Status</h4>
      <div className="status-grid">
        <div className={`status-item ${messageData ? 'connected' : 'waiting'}`}>
          📨 Messages: {messageData ? '✅ Connected' : '🔄 Waiting'}
        </div>
        <div className={`status-item ${notificationData ? 'connected' : 'waiting'}`}>
          🔔 Notifications: {notificationData ? '✅ Connected' : '🔄 Waiting'}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.reload();
  };

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <h1>NestJS GraphQL WebSocket Test</h1>
          {isLoggedIn && (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          )}
        </header>
        
        <main>
          {!isLoggedIn ? (
            <LoginForm />
          ) : (
            <div>
              <h2>Welcome to Real-time Dashboard!</h2>
              <RealtimeStatus />
              <NotificationCenter />
            </div>
          )}
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;