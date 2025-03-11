import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { validateToken, login as loginApi, logout as logoutApi, register as registerApi } from '../services/api';
import { io } from 'socket.io-client';

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Connect to socket when authenticated and disconnect when not
  useEffect(() => {
    // Clean up function to disconnect socket
    const disconnectSocket = () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

    // Only connect when authenticated
    if (isAuthenticated && user) {
      // Connect to socket
      const SOCKET_URL = 'http://localhost:4000'; // SSO server URL
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true
      });

      // Handle connection
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        
        // Authenticate socket connection with user ID
        socketRef.current.emit('authenticate', user.id);
      });

      // Handle force-logout event
      socketRef.current.on('force-logout', (data) => {
        console.log('Force logout received:', data);
        setUser(null);
        setIsAuthenticated(false);
        setError(data.message || 'You have been logged out from another device');
      });

      // Handle socket errors
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Clean up socket on unmount
      return disconnectSocket;
    } else {
      // Disconnect if not authenticated
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await validateToken();
        if (response.valid) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        // If the error is due to session invalidation, handle it
        if (error.message && error.message.includes('Session invalidated')) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Periodically validate session to detect logout from other clients
  useEffect(() => {
    // Only check when user is authenticated
    if (!isAuthenticated) return;

    const sessionCheckInterval = setInterval(async () => {
      try {
        const response = await validateToken();
        if (!response.valid) {
          // Session is no longer valid (invalidated by another client)
          setUser(null);
          setIsAuthenticated(false);
          setError('You have been logged out from another device');
        }
      } catch (error) {
        console.error('Session check error:', error);
        // If the error is due to session invalidation, handle it
        if (error.message && error.message.includes('Session invalidated')) {
          setUser(null);
          setIsAuthenticated(false);
          setError('You have been logged out from another device');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      await registerApi(userData);
      return { success: true };
    } catch (error) {
      setError(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await loginApi(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 