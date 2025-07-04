﻿# JWT-based SSO Authentication System

![JWT Logo](https://jwt.io/img/pic_logo.svg)

A modern, secure Single Sign-On (SSO) authentication system using JWT tokens with React frontends and a Node.js/Express backend.

## 🌟 Features

- **Single Sign-On (SSO)** - Log in once, access multiple applications
- **JWT Authentication** - Secure token-based authentication
- **Modern UI** - Sleek, responsive interface built with React
- **Multiple Clients** - Demonstrates SSO across separate applications
- **Secure Storage** - HttpOnly cookies for token storage
- **Token Refresh** - Automatic JWT token refresh mechanism

## 🏗️ Architecture

This project consists of three main components:

- **SSO Server** - Authentication server running on `localhost:4000`
- **Client 1** - React application running on `localhost:3000`
- **Client 2** - React application running on `localhost:3001`

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - React Router v6
  - Axios
  - CSS3 with custom variables

- **Backend**:
  - Node.js
  - Express
  - MongoDB with Mongoose
  - JSON Web Tokens (JWT)
  - Bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or remote instance)

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rahultapase/SSO-using-JWT.git
   cd jwt-sso-auth
   ```

2. **Install dependencies for all applications**:
   ```bash
   npm run install:all
   ```
   
   This will install dependencies for:
   - Root project
   - SSO Server
   - Client 1
   - Client 2

3. **Environment Setup**:
   Create a `.env` file in the `sso-server` directory with the following variables:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/sso-auth
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d
   CLIENT1_URL=http://localhost:3000
   CLIENT2_URL=http://localhost:3001
   ```

## 🏃‍♂️ Running the Application

1. **Start MongoDB** (if using local instance):
   ```bash
   cd sso-server
   npm start   
   ```

2. **Start all clients concurrently**:
   ```bash
   cd client1
   npm start
   ```
   ```bash
   cd client2
   npm start
   ```

   This will start:
   - SSO Server on port 4000
   - Client 1 on port 3000
   - Client 2 on port 3001

## 🔍 How It Works

1. **User Registration**:
   - Register on either Client 1 or Client 2
   - User data is stored in the MongoDB database

2. **Authentication Flow**:
   - User logs in on either client
   - SSO server validates credentials and issues JWT tokens
   - Access token (short-lived) and refresh token (long-lived) are stored as HttpOnly cookies

3. **Single Sign-On**:
   - After logging in to one client, navigate to the other client
   - The second client detects the JWT cookie and validates it with the SSO server
   - If valid, user is automatically logged in

4. **Token Refresh**:
   - When the access token expires, the refresh token is used to get a new one
   - This happens automatically in the background

5. **Logout**:
   - Logging out clears cookies and invalidates the refresh token
   - User is logged out from all clients

## 📚 API Endpoints

### SSO Server API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login and get JWT tokens |
| `/api/auth/logout` | POST | Logout and clear tokens |
| `/api/auth/validate` | GET | Validate JWT token |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/me` | GET | Get current user info |

## 📂 Project Structure

```
jwt-sso-auth/
├── package.json         # Root package.json with scripts
├── .gitignore           # Git ignore file
├── README.md            # Project documentation
├── client1/             # Client 1 React application
│   ├── public/          # Static files
│   └── src/             # React source code
├── client2/             # Client 2 React application
│   ├── public/          # Static files
│   └── src/             # React source code
└── sso-server/          # SSO Authentication server
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── middleware/      # Express middleware
    └── utils/           # Utility functions
```

## 🔒 Security Considerations

- JWT tokens are stored in HttpOnly cookies to prevent XSS attacks
- CORS is configured to allow only the client applications
- Passwords are hashed using bcrypt before storage
- Token refresh mechanism enhances security while maintaining user sessions
- Access tokens have short expiration times to minimize risk

## 🎯 Future Enhancements

- Email verification
- Password reset functionality
- Role-based access control
- Multi-factor authentication
- OAuth integration
- Account management features

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
