const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const teamRoutes = require('./routes/team_routes');
const cors = require('cors');
require('./conn.js'); // Ensure your MongoDB connection is established

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Export `io` for use in other modules


// Constants
const port = process.env.PORT || 5006;
let connectedClients = 0; // Track the number of connected clients

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api', teamRoutes); // Ensure your team routes have access to `io`

// Socket.IO connection handling
io.on('connection', (socket) => {
  connectedClients++; // Increment client count when a new client connects
  io.emit('clientsCount', { count: connectedClients });

  // Listen for tournament connection and join the room
  socket.on('joinTournament', (tournamentId) => {
    socket.join(tournamentId); // Join the specific tournament room
    console.log(`Client joined tournament room: ${tournamentId}`);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    connectedClients--; // Decrement client count when a client disconnects
    io.emit('clientsCount', { count: connectedClients });
  });
});

module.exports = { io };

// Start the server
server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
