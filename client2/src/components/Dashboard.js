import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="client-info">
        <h3>Client 2 Dashboard</h3>
        <p>Running on localhost:3001</p>
      </div>
      
      <div className="dashboard-container">
        <div className="card text-center">
          <div className="card-title">User Information</div>
          <div className="card-body">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </div>
        
        <div className="card mt-3 text-center">
          <div className="card-title">Single Sign-On Demonstration</div>
          <div className="card-body">
            <p>
              You are now logged in to Client 2. This demonstrates that the SSO authentication is working correctly.
            </p>
            <div className="mt-3">
              <a 
                href="http://localhost:3000/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn"
              >
                Visit Client 1 Dashboard
              </a>
            </div>
            <p className="mt-3">
              The JWT token stored in your browser's cookies is being validated by the SSO server,
              allowing you to access both client applications without logging in again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 