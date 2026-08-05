const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const FRONT_URLS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
];

const io = new Server(server, {
    cors: {
        origin: FRONT_URLS,
        methods: ["GET", "POST"],
        credentials: true
    },
});

const roomMembers = {};

function membersOf(room) {
    if (!roomMembers[room]) return [];
    return Array.from(roomMembers[room].values());
}

function leaveCurrentRoom(socket) {

    const room = socket.data.room;

    if (!room) return;

    if (roomMembers[room]) {

        roomMembers[room].delete(socket.id);

        if (roomMembers[room].size === 0) {
            delete roomMembers[room];
        }
    }

    socket.leave(room);
    socket.data.room = null;

    io.to(room).emit("room_members", { members: membersOf(room) });
}

io.on("connection", (socket) => {

    console.log("connected: ", socket.id);

    socket.on("join_room", (data) => {

        const room = String(data.room_id);
        const username = data.username || "unknown";

        if (socket.data.room === room) {
            socket.emit("room_members", { members: membersOf(room) });
            return;
        }

        leaveCurrentRoom(socket);

        socket.join(room);
        socket.data.room = room;
        socket.data.username = username;

        if (!roomMembers[room]) {
            roomMembers[room] = new Map();
        }

        roomMembers[room].set(socket.id, username);

        console.log("room_id: ", room, "| joined: ", username);

        socket.to(room).emit("user_joined", { username: username });

        io.to(room).emit("room_members", { members: membersOf(room) });
    });

    socket.on("leave_room", () => {
        leaveCurrentRoom(socket);
    });

    socket.on("sendMessage", (data) => {

        const room = String(data.id);

        io.to(room).emit("sendMessage", {
            username: data.username,
            email: data.email,
            Message: data.Message
        });
    });

    socket.on("disconnect", () => {
        console.log("disconnected: ", socket.id);
        leaveCurrentRoom(socket);
    });
});

server.listen(4000, () => {
    console.log("Server running on port 4000");
});