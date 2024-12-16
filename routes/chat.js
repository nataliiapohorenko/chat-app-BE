const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat');

router.get('/', chatController.getChats);

router.get('/:chatId', chatController.getChat);

router.post('/chat', chatController.createChat);

router.post('/message', chatController.postMessage);

module.exports = router;