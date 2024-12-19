const { ObjectId } = require('mongodb');

const Chat = require('../models/chat');
const Message = require('../models/message');
const { fetchData } = require('../services/apiService');

const {createChat, createMessage} = require('../utils/chatUtil')

exports.getChats = async (req, res, next) => {
    const { email } = req.user;
    try {
        const chats = await Chat.find({createdBy: email});
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
    const createdBy = req.user.email;
    const botName = req.body.firstName;
    const botSurname = req.body.lastName;
    try {
        const chat = await createChat(createdBy, botName, botSurname);
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

exports.updateChat = async (req, res, next) => {
    const chatId = req.body.id;
    const botName = req.body.firstName;
    const botSurname = req.body.lastName;
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            const error = new Error('Could not find chat.');
            error.statusCode = 404;
            throw error;
        }
        chat.botName = botName;
        chat.botSurname = botSurname;
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

exports.deleteChat = async (req, res, next) => {
    const chatId = req.body.id;
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            const error = new Error('Could not find chat.');
            error.statusCode = 404;
            throw error;
        }
        await chat.deleteOne();
        await Message.deleteMany({chatId})
        res.status(201).json({
            message:'deleted'
        });;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postMessage = async(req, res, next) => {
    const chatId = req.body.id;
    let content = req.body.message;
    try{
        const {message, response, updateNotification} = await createMessage(chatId, content);
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

exports.updateMessage = async(req, res, next) => {
    const id = req.body.id;
    let content = req.body.message;
    try {
        const message = await Message.findById(id);
        if (!message) {
            const error = new Error('Could not find message.');
            error.statusCode = 404;
            throw error;
        }
        message.content = content;
        await message.save();
        res.status(201).json({
            message
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}