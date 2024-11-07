const express = require('express');
const mongoose = require('mongoose');
const teamRoutes = require('./routes/team_routes');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { initializeWebSocket } = require('./utils/ws'); // Import WebSocket setup

const app = express();
const PORT = process.env.PORT || 5006;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api', teamRoutes);

app.use(express.static(path.resolve(__dirname, 'client', 'dist')));

// Route to serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

// Create an HTTP server
const server = http.createServer(app);

// Initialize WebSocket server on the HTTP server
initializeWebSocket(server); // Call the WebSocket initializer

// Connect to MongoDB
mongoose.connect(process.env.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.log('Error connecting to MongoDB:', error));

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
