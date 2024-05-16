const express = require('express');
const http = require('http');
const path=require("path")
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Map user IDs to socket IDs
const usersMap = new Map();
app.use(express.static(path.resolve("./public")));
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user authentication and socket registration
    socket.on('login', (userId) => {
        console.log('User logged in:', userId);

        // Associate user ID with socket ID
        usersMap.set(userId, socket.id);

        // Store userId as a property of the socket object
        socket.userId = userId;

        // Notify client that login was successful
        socket.emit('login success', userId);
    });

    // Handle messages from clients
    socket.on('private message', ({ to, message }) => {
        console.log('Private message received:', message);

        // Get the recipient's socket ID
        const recipientSocketId = usersMap.get(to);

        if (recipientSocketId) {
            // Send the message to the recipient's socket
            io.to(recipientSocketId).emit('private message', { userId: socket.userId, message });
        } else {
            console.log('Recipient not found');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');

        // Remove user ID from the map upon disconnection
        usersMap.forEach((socketId, userId) => {
            if (socketId === socket.id) {
                usersMap.delete(userId);
            }
        });
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
