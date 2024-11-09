// websocket.js
const { Server } = require("socket.io");

let wsconnecteduser = 0;
let roomid = [];
let io;

function initializeWebSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        wsconnecteduser++;
        // console.log("Connected user count:", wsconnecteduser);
        socket.emit("connectedcount", wsconnecteduser);

        socket.roomsJoined = [];

        socket.on('roomId', (data) => {
            socket.join(data);
            socket.roomsJoined.push(data);

            const room = roomid.find(r => r.id === data);

            if (!room) {
                roomid.push({ id: data, count: 1 });
            } else {
                room.count++;
            }

            const updatedRoom = roomid.find(r => r.id === data);
            io.to(data).emit("connectedcount", updatedRoom.count);

            // console.log("Room details:", roomid);
        });

        socket.on('disconnect', () => {
            wsconnecteduser--;
            // console.log("User disconnected:", socket.id);

            socket.roomsJoined.forEach(roomId => {
                const room = roomid.find(r => r.id === roomId);
                if (room) {
                    room.count--;
                    if (room.count === 0) {
                        roomid = roomid.filter(r => r.id !== roomId);
                    }
                    io.to(roomId).emit("connectedcount", room.count);
                }
            });

            // console.log("Updated room details after disconnect:", roomid);
        });
    });

}
const socketfunc = (receivee, flag, data) => {
    // console.log("socketfunc runned", receivee)
    io.to(receivee).emit(flag, data);
};

module.exports = { initializeWebSocket,socketfunc };
