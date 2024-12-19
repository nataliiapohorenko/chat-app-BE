const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');
const { OAuth2Client } = require('google-auth-library');

const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const client = new OAuth2Client(process.env.CLIENT_ID);
const { fetchData } = require('./services/apiService');
const Chat = require('./models/chat');
const Message = require('./models/message');

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception thrown:', error);
    process.exit(1);
});

const app = express();

app.use(cors({
    origin: '*',
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  }));
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/healthcheck' , (req, res, next) => {
    res.send('Server is running fine!');
})

app.use('/chat', chatRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
        });

        io.on('connection', (socket) => {
            let userEmail;
            let isAuthorized = false;
            let timeout = null;

            socket.on('authorization', async (token) => {
                let payload;
                try {
                    const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: process.env.CLIENT_ID,
                });
                payload = ticket.getPayload();
                } catch (error) {
                    console.error('Error verifying token:', error);
                    return;
                }
                userEmail = payload.email;
                isAuthorized = true;
            });

            socket.on('autoMessaging', (isAutoMessaging) => {
                if (!isAuthorized) {
                    return;
                }
                if (timeout) {
                    clearInterval(timeout);
                    timeout = null;
                }
                async function sendMessage(){
                    try{
                        const randomChat = await Chat.aggregate([
                            { $match: { createdBy: userEmail } }, 
                            { $sample: { size: 1 } }              
                        ]);
                        if (!randomChat.length) {
                            console.log('No chats found for the user.');
                            return;
                        }
                        const timestamp = new Date().toISOString();
                        const chatId = randomChat[0]._id;
                        const data = await fetchData('/random');
                        const responseSender = 'bot';
                        const responseContent = data[0].q;
                        const responseTimestamp = new Date().toISOString();
                        const response = new Message({
                            chatId,
                            sender: responseSender,
                            content: responseContent,
                            timestamp: responseTimestamp
                        });
                        await response.save();
                        const chat = await Chat.findById(chatId);
                        chat.lastMessage.sender = responseSender;
                        chat.lastMessage.content = responseContent;
                        chat.lastMessage.timestamp = responseTimestamp;
                        await chat.save();
                        updateNotification = timestamp;
                        socket.emit('autoMessaging',{ response, updateNotification })
                    } catch (error){
                        console.error('Error sending message:', error);
                    }
                     
                }
                

                if(isAutoMessaging){
                    sendMessage();
                    timeout = setInterval(sendMessage, 5000); 
                }
            });
        });

        const PORT = process.env.PORT || 8080;
        server.listen(PORT);
    })
    .catch(err => console.log(err));



