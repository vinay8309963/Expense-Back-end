const express = require('express');

const router = express.Router();

const expenseController = require('../controllers/expense')

const authenticatemiddleware = require('../middleware/auth');

router.post('/addexpense', authenticatemiddleware.authenticate, expenseController.addexpense )

router.get('/getexpenses', authenticatemiddleware.authenticate, expenseController.getexpenses )

router.delete('/deleteexpense/:expenseid', authenticatemiddleware.authenticate, expenseController.deleteexpense);

module.exports = router;