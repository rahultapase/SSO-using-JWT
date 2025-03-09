import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <div className="client-info">
        <h3>Client 2</h3>
        <p>Running on localhost:3001</p>
      </div>
      
      <div className="home-content">
        <h2>Welcome to the SSO using JWT Demo</h2>
        {/* <p>
          This is a demonstration of Single Sign-On (SSO) using JWT tokens.
          If you've already logged in to Client 1, you should be automatically logged in here as well.
        </p> */}
        
        {isAuthenticated ? (
          <div className="card">
            <div className="card-title">Welcome back, {user.username}!</div>
            <div className="card-body">
              <p>You are successfully logged in to Client 2.</p>
              <div className="mt-3">
                <Link to="/dashboard" className="btn">
                  Go to Dashboard
                </Link>
              </div>
              <div className="mt-3">
                <a 
                  href="http://localhost:3000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Visit Client 1
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-title">Get Started</div>
            <div className="card-body">
              <p>Please log in or register to access the dashboard and test the SSO functionality.</p>
              <p className="mt-3">
                If you've already logged in to Client 1, try refreshing this page to use SSO.
              </p>
              <div className="mt-3">
                <Link to="/login" className="btn">
                  Login
                </Link>
                {' '}
                <Link to="/register" className="btn btn-secondary">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* <div className="card mt-3">
          <div className="card-title">How It Works</div>
          <div className="card-body">
            <p>
              This application demonstrates a Single Sign-On (SSO) system using JWT (JSON Web Tokens).
              When you log in to one client, you'll be automatically authenticated on the other client as well.
            </p>
            <p>
              The system uses secure HttpOnly cookies to store authentication tokens,
              providing both security and convenience.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Home; 