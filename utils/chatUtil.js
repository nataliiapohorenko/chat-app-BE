const Chat = require('../models/chat');
const Message = require('../models/message');
const { fetchData } = require('../services/apiService');

async function createChat(user, botName, botSurname) {
    const chat = new Chat({
        createdBy: user,
        botName,
        botSurname
    });
    return await chat.save();
}


async function createMessage(chatId, content) {
    const sender = 'user';
    const timestamp = new Date().toISOString();
    const message = new Message({
        chatId,
        sender,
        content,
        timestamp
    });
    let response, updateNotification;
    await message.save();
    const data = await fetchData('/random');
    const responseSender = 'bot';
    const responseContent = data[0].q;
    const responseTimestamp = new Date().toISOString();
    response = new Message({
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
    return { message, response, updateNotification };
}

module.exports = { createChat, createMessage };