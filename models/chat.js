const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    createdBy: { 
        type: String, 
        required: true 
    },
    botName: { 
        type: String, 
        required: true 
    }, 
    botSurname: { 
        type: String, required: true
    },
    lastMessage: {
        content: {
            type: String
        },
        timestamp: {
            type: Date
        },
        sender: {
            type: String
        }
    },
    createdAt: {   
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Chat', ChatSchema);
