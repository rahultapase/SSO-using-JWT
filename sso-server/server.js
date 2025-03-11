require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT1_URL, process.env.CLIENT2_URL],
    credentials: true
  }
});
const PORT = process.env.PORT || 4000;

// User socket mappings
const userSockets = new Map(); // userId -> Set of socket IDs

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Client authentication
  socket.on('authenticate', (userId) => {
    if (!userId) return;
    
    // Store user's socket connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
    socket.userId = userId; // Store userId on socket for later reference
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId && userSockets.has(socket.userId)) {
      userSockets.get(socket.userId).delete(socket.id);
      
      // Clean up if no more sockets for this user
      if (userSockets.get(socket.userId).size === 0) {
        userSockets.delete(socket.userId);
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available throughout the application
app.set('io', io);
app.set('userSockets', userSockets);

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS to allow requests from client applications
app.use(cors({
  origin: [process.env.CLIENT1_URL, process.env.CLIENT2_URL],
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the SSO Authentication Server' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start the server
  server.listen(PORT, () => {
    console.log(`SSO Server is running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
}); 