// index.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { initializeWebSocket } = require('./utils/ws');  // Import the function
const teamRoutes = require('./routes/team_routes');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 5006;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api', teamRoutes);

// Serve static files from frontend's dist folder
app.use(express.static(path.resolve(__dirname, 'client', 'dist')));

// Root URL route
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

// Catch-all route to handle all other frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

// HTTP server
const server = http.createServer(app);

// Initialize WebSocke and pass the server once
initializeWebSocket(server);  // This starts the WebSocket server


// MongoDB Connection
mongoose.connect(process.env.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
