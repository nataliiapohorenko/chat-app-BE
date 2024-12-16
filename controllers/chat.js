const { ObjectId } = require('mongodb');

const Chat = require('../models/chat');
const Message = require('../models/message');
const { fetchData } = require('../services/apiService');

exports.getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find();
        res.json({
            chats: chats
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getChat = async (req, res, next) => {
    const chatId = req.params.chatId;
    try {
        const messages = await Message.find({chatId: new ObjectId(chatId)});
        res.json({
            messages
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createChat = async (req, res, next) => {
    const botName = req.body.firstName;
    const botSurname = req.body.lastName;
    const chat = new Chat({
        botName,
        botSurname
    });
    try {
        await chat.save();
        res.status(201).json({
            chat
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postMessage = async(req, res, next) => {
    const chatId = req.body.id;
    let sender = 'user';
    let content = req.body.message;
    let timestamp = new Date().toISOString();
    const message = new Message({
        chatId,
        sender,
        content,
        timestamp
    })
    try{
        await message.save();
        const data = await fetchData('/random');
        sender = 'bot';
        content = data[0].q;
        timestamp = new Date().toISOString();
        const response = new Message({
            chatId,
            sender,
            content,
            timestamp
        });
        await response.save();
        const chat = await Chat.findById(chatId);
        chat.lastMessage.sender = sender;
        chat.lastMessage.content = content;
        chat.lastMessage.timestamp = timestamp;
        await chat.save();
        const updateNotification = timestamp;
        res.status(201).json({
            message, response, updateNotification
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}