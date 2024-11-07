// utils/ws.js
const WebSocket = require('ws');

// Store connections by tournament ID
const clientsByTournament = {};

const initializeWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    // WebSocket connection handler
    wss.on('connection', (ws, req) => {
        ws.on('message', (message) => {
            const { tournamentId } = JSON.parse(message);

            // Ensure we have a list of clients for this tournament ID
            if (!clientsByTournament[tournamentId]) {
                clientsByTournament[tournamentId] = new Set();
            }

            // Track the WebSocket connection by tournament ID
            clientsByTournament[tournamentId].add(ws);

            // Log the current number of connected users for this tournament
            console.log(`User connected to tournament: ${tournamentId}`);
            console.log(`Total users connected to tournament ${tournamentId}: ${clientsByTournament[tournamentId].size}`);

            // Clean up on WebSocket close
            ws.on('close', () => {
                clientsByTournament[tournamentId].delete(ws);
                console.log(`User disconnected from tournament: ${tournamentId}`);
                console.log(`Total users connected to tournament ${tournamentId}: ${clientsByTournament[tournamentId].size}`);
            });
        });
    });
};

// Utility function to send updates to clients
const broadcastUpdate = (tournamentId, data) => {
    // console.log(`Broadcasting update to tournament ${tournamentId}`, data);
    const clients = clientsByTournament[tournamentId];

    if (clients && clients.size > 0) {
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    } else {
        console.log(`No clients connected to tournament ${tournamentId}`);
    }
};

module.exports = { initializeWebSocket, broadcastUpdate };
