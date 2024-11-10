// websocket.js
const { Server } = require("socket.io");

let roomid = [];
let modroomId = [];
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

        socket.roomsJoined = [];
        socket.modroomsJoined = [];

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
        socket.on('modroomId', (data) => {
            socket.join(data);
            socket.modroomsJoined.push(data);

            const room = modroomId.find(r => r.id === data);

            if (!room) {
                modroomId.push({ id: data, count: 1 });
            } else {
                room.count++;
            }

            const updatedRoom = modroomId.find(r => r.id === data);
            io.to(data).emit("modconnectedcount", updatedRoom.count);

            // console.log("Mod Room details:", modroomId);
        });

        socket.on('disconnect', () => {
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

            socket.modroomsJoined.forEach(modRoomId => {
                const modRoom = modroomId.find(r => r.id === modRoomId);
                if (modRoom) {
                    modRoom.count--;
                    if (modRoom.count === 0) {
                        modroomId = modroomId.filter(r => r.id !== modRoomId);
                    }
                    io.to(modRoomId).emit("modconnectedcount", modRoom.count);
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

module.exports = { initializeWebSocket, socketfunc };
