const express = require('express');
const router = express.Router();

router.post('/login', (req, res, next) => {
    res.send('Auth route working!');
});

module.exports = router;
