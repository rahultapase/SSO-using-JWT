import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-content">
      <div className="client-info">
        <h3>Client 2</h3>
        <p>Running on localhost:3001</p>
      </div>
      
      <h2>Welcome to the JWT SSO Authentication Demo</h2>
      <p>
        This is a demonstration of Single Sign-On (SSO) using JWT tokens.
        If you've already logged in to Client 1, you should be automatically logged in here as well.
      </p>
      
      {isAuthenticated ? (
        <div>
          <p>You are logged in as <strong>{user.username}</strong></p>
          <p>
            <Link to="/dashboard" className="btn">
              Go to Dashboard
            </Link>
          </p>
          <p className="mt-3">
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
            >
              Visit Client 1
            </a>
          </p>
        </div>
      ) : (
        <div>
          <p>Please log in or register to access the dashboard.</p>
          <p>
            <Link to="/login" className="btn">
              Login
            </Link>
            {' '}
            <Link to="/register" className="btn">
              Register
            </Link>
          </p>
          <p className="mt-3">
            If you've already logged in to Client 1, try refreshing this page.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home; 