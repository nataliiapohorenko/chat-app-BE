const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());

app.use(cors({
    origin: '*', 
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

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
    .connect(
        'mongodb+srv://natalo4ka:UX1T9esO4S9q3cBA@cluster0.qdfxh.mongodb.net/chat?retryWrites=true&w=majority&appName=Cluster0'
    )
    .then(result => {
        const server = app.listen(8080);
        // const io = require('./socket').init(server);
        // io.on('connection', socket => {
        //     console.log('Client connected');
        // });
    })
    .catch(err => console.log(err));



