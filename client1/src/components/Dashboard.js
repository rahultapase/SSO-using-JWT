import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="client-info">
        <h3>Client 1 Dashboard</h3>
        <p>Running on localhost:3000</p>
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
              You are now logged in to Client 1. You can visit Client 2 and you will be automatically logged in there as well.
            </p>
            <div className="mt-3">
              <a 
                href="http://localhost:3001/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn"
              >
                Visit Client 2 Dashboard
              </a>
            </div>
            <p className="mt-3">
              This works because both clients share the same authentication server and use JWT tokens stored in cookies.
              When you visit Client 2, it will validate your token with the SSO server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 