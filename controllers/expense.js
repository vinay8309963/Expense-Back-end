const Expense = require('../models/expenses');
const jwt = require('jsonwebtoken');
const User = require('../models/users')
const sequelize = require('../util/database');
const s3Services = require('../services/s3Services')
const files = require('../models/downloadedfiles')

//////////adding expenses

const addexpense = async (req, res) => {
    const t = await sequelize.transaction();
    const id = jwt.verify(req.headers.authorization, 'SECRETKEY')
    console.log(req.body)
    console.log('hello vinay')
    console.log(id)
    const { date, expenseamount, description, category} = req.body;
    try {
        const expense = await Expense.create({ date, expenseamount, description, category, userId: id }, {
            transaction: t
        })
        let tot;
        const tot_exp = await User.findByPk(id)
        if (tot_exp.totalExp === null) { tot = 0 } else { tot = tot_exp.totalExp }
        await User.update({ totalExp: Number(tot) + Number(expenseamount) }, { where: { id: id }, transaction: t })

        await t.commit();
        return res.status(201).json({ expense, success: true });
    } catch (err) {
        if (err) { t.rollback() }

        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}


///////////getting expenses

const getexpenses = (req, res) => {
    const token = req.header('authorization');
    const userid = Number(jwt.verify(token, process.env.TOKEN_SECRET));
    Expense.findAll({where : { userId: userid}}).then(expenses => {
        console.log('hello expenses')
        console.log(expenses)
        return res.status(200).json({ expenses, success: true })
    })
        .catch(err => {
            return res.status(402).json({ error: err, success: false })
        })
}


//////////deleting expense

const deleteexpense = async (req, res) => {
    const userId = jwt.verify(req.headers.authorization, 'SECRETKEY')
    console.log(userId)
    const expenseid = req.params.expenseid;
    console.log(expenseid)
    const t = await sequelize.transaction();
    try {

        const tot_exp = await User.findByPk(userId)
        const data = await Expense.findByPk(expenseid)
        console.log(data)
        console.log(data.expenseamount)
        await User.update({ totalExp: (Number(tot_exp.totalExp) - Number(data.expenseamount)) }, { where: { id: userId }, transaction: t })
        await Expense.destroy({
            where: {
                id: expenseid
            }
        })
        await t.commit();
        return res.status(204).json({ success: true, message: "Deleted Successfuly" })
    } catch (err) {
        await t.rollback();
        console.log(err);
        return res.status(403).json({ success: true, message: "Failed" })
    }
}


//////////download expenses using s3

const downloadExpenses = async (req, res, next) => {
    try {
        const expenses = await req.user.getExpenses();
        console.log(expenses)
        const stringifiedExpenses = JSON.stringify(expenses);
        console.log(stringifiedExpenses)
        const userId = req.user.id
        const filename = `expenses${userId}/${new Date()}.txt`;
        const fileURL = await s3Services.uploadToS3(stringifiedExpenses, filename);
        await files.create({ date: new Date(), fileUrl: fileURL })
        console.log(fileURL)
        res.status(200).json({ fileURL, success: true });
    } catch (err) {
        console.log(err);
        res.json(500).json({ fileURL: '', success: false, err: err })
    }
}


///////lead board page

const leadboardPage = async (req, res, next) => {
    try {
        const exp = await User.findAll({
            attributes: ['name', 'totalExp'],
            order: [[sequelize.col('totalExp'), 'DESC']]
        })
        res.status(200).json(exp)
    } catch (err) {
        throw new Error(err)
    }

}


module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadExpenses,
    leadboardPage
}