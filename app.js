const path = require('path');
const express = require('express');
const fs = require('fs');
var cors = require('cors')
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan')

const sequelize = require('./util/database');

const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const resetPasswordRoutes = require('./routes/resetpassword')
const accessLogServices = fs.createWriteStream(path.join(__dirname,'access.log'),{flags: 'a'})

const app = express();

app.use(cors());
app.use(express.json());

//Helmet
app.use(helmet());
app.use(compression())
app.use(morgan('combined',{stream: accessLogServices}))

app.use('/user', userRoutes);
app.use('/user', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/password', resetPasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

sequelize.sync()
    .then(() => {
        console.log("server running on port  3000")
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err);
    })