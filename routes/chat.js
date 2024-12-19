const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const chatController = require('../controllers/chat');

router.get('/', isAuth, chatController.getChats);

router.get('/:chatId', isAuth, chatController.getChat);

router.post('/chat', isAuth, chatController.createChat);

router.post('/message', isAuth, chatController.postMessage);

router.put('/chat', isAuth, chatController.updateChat);

router.delete('/chat', isAuth, chatController.deleteChat);

router.put('/message', isAuth, chatController.updateMessage);

module.exports = router;