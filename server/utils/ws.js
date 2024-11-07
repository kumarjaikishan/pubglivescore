const WebSocket = require('ws');

// Store connections by tournament ID
const clientsByTournament = {};

const initializeWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    // Log the WebSocket port once the server is started
    wss.on('listening', () => {
        const address = server.address();
        console.log(`WebSocket server running on port ${address.port}`);
    });

    // WebSocket connection handler
    wss.on('connection', (ws, req) => {
        let tournamentId = null; // Track the tournamentId for this specific connection

        ws.on('message', (message) => {
            const { tournamentId: receivedTournamentId } = JSON.parse(message);

            tournamentId = receivedTournamentId; // Save the tournamentId for this connection

            // Ensure we have a list of clients for this tournament ID
            if (!clientsByTournament[tournamentId]) {
                clientsByTournament[tournamentId] = new Set();
            }

            // Track the WebSocket connection by tournament ID
            clientsByTournament[tournamentId].add(ws);

            // Log the current number of connected users for this tournament
            console.log(`User connected to tournament: ${tournamentId}`);
            console.log(`Total users connected to tournament ${tournamentId}: ${clientsByTournament[tournamentId].size}`);

            // Send the number of connected clients to all clients of this tournament
            broadcastClientCount(tournamentId);

            // Clean up on WebSocket close
            ws.on('close', () => {
                clientsByTournament[tournamentId].delete(ws);
                console.log(`User disconnected from tournament: ${tournamentId}`);
                console.log(`Total users connected to tournament ${tournamentId}: ${clientsByTournament[tournamentId].size}`);

                // Send the updated number of connected clients to all clients
                broadcastClientCount(tournamentId);
            });
        });
    });
};

// Utility function to broadcast the connected client count
const broadcastClientCount = (tournamentId) => {
    const clients = clientsByTournament[tournamentId];

    if (clients && clients.size > 0) {
        const clientCountMessage = {
            type: 'clientsCount',
            count: clients.size, // Send the number of connected clients
        };

        // Broadcast the client count to all connected clients of the tournament
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(clientCountMessage));
            }
        });
    } else {
        console.log(`No clients connected to tournament ${tournamentId}`);
    }
};

// Utility function to send updates to clients
const broadcastUpdate = (tournamentId, data) => {
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
