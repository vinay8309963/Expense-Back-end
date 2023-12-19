const express = require('express');
const path = require('path');

const userController = require('../controllers/user');
const expenseController = require('../controllers/expense');
const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', userController.mainPage);

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Signup/signup.html'));
});

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/premium',userController.premiumPage)

router.get('/leadboard',authenticatemiddleware.authenticate,expenseController.leadboardPage);

router.get('/download', authenticatemiddleware.authenticate, expenseController.downloadExpenses)

module.exports = router;