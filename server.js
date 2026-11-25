import http from 'http';
import { Server } from 'socket.io';
import './config/loadEnv.js';
import app from './app.js';
import connectDB from './config/db.js';
import { initTrackingSocket } from './sockets/trackingSocket.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO with permissive localhost CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach socket handlers
initTrackingSocket(io);

// Export io so controllers can emit global notifications if needed
export { io };

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[TransitOps Server] Running on http://127.0.0.1:${PORT}`);
  console.log(`[TransitOps Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
