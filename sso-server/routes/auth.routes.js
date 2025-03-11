const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt.utils');
const { verifyJWT } = require('../middleware/auth.middleware');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to the activeSessions array
    user.activeSessions.push({ refreshToken });
    await user.save();

    // Set access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout user (synchronized across all devices)
router.post('/logout', async (req, res) => {
  try {
    // Clear cookies for current client
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // If user is logged in, clear ALL refresh tokens from the database (global logout)
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = verifyToken(refreshToken);
      if (decoded) {
        // Get user ID
        const userId = decoded.id;
        
        // Remove all active sessions for this user
        await User.findByIdAndUpdate(userId, { activeSessions: [] });
        
        // Emit logout event to all connected clients of this user
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        
        if (io && userSockets && userSockets.has(userId)) {
          const socketIds = userSockets.get(userId);
          
          // Emit 'force-logout' event to all of user's connected sockets
          socketIds.forEach(socketId => {
            io.to(socketId).emit('force-logout', { 
              message: 'You have been logged out from another device'
            });
          });
          
          console.log(`Emitted force-logout to ${socketIds.size} connected clients for user ${userId}`);
          
          // Clear socket mappings for this user
          userSockets.delete(userId);
        }
      }
    }

    res.json({ message: 'Logout successful from all devices' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate token
router.get('/validate', async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ valid: false });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    // Check if refresh token exists in user's active sessions
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const hasValidSession = user.activeSessions.some(
        session => session.refreshToken === refreshToken
      );
      
      if (!hasValidSession) {
        // This session was invalidated by another client's logout
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(401).json({ 
          valid: false,
          message: 'Session invalidated by logout from another device'
        });
      }
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Find user with matching refresh token in active sessions
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Check if the refresh token exists in the user's active sessions
    const sessionIndex = user.activeSessions.findIndex(
      session => session.refreshToken === refreshToken
    );
    
    if (sessionIndex === -1) {
      // This means the token was invalidated by logout from another device
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({ 
        message: 'Session invalidated by logout from another device'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in active sessions
    user.activeSessions[sessionIndex].refreshToken = newRefreshToken;
    await user.save();

    // Set new tokens in cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', verifyJWT, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = router; 