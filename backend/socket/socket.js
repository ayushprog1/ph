import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: process.env.URL,
        methods: ['GET', 'POST']
    }
});

const userSocketMap = {}; //this map stores socket id corresponding the user id ;userId -> socketId
//console.log("Current userSocketMap abefire user disconnection:", userSocketMap);
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

//console.log("hello");
io.on('connection', (socket)=>{
    //console.log("user connected");
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        console.log(`user connected: ${userId} , ${socket.id}`);
    }//else{
    //     console.log("user not connected");

    // }
    

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    //console.log("Current userSocketMap after user disconnection:", userSocketMap);
    socket.on('disconnect',()=>{
        if(userId){
            console.log(`user disconnected: ${userId} , ${socket.id}`);
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});


export { app, server, io };