const { ObjectId } = require('mongodb');

const Chat = require('../models/chat');
const User = require('../models/user');
const { fetchData } = require('../services/apiService');

const {createChat, createMessage} = require('../utils/chatUtil')

exports.login = async (req, res, next) => {
    const { email, name } = req.user;
    try {
        const user = await User.findOne({ email: email });
        let newUser;
        if (!user) {
            newUser = new User({
                email,
                name
            });
            await newUser.save();
            const newChat = await createChat(newUser.email, 'Alice', 'Freeman');
            const chatId = newChat._id;
            await createChat(newUser.email, 'Peter', 'Jackson');
            await createChat(newUser.email, 'Tacker', 'Internship');
            await createMessage(chatId, `Hello!`);
            await createMessage(chatId, `How are you?`);
        } else{
            newUser = user;
        }
        res.json({
            user: newUser
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};