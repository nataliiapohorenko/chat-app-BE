const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const authController = require('../controllers/auth');

router.post('/login', isAuth, authController.login);


module.exports = router;
