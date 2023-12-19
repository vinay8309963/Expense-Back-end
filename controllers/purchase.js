const Razorpay = require('razorpay');
const Order = require('../models/orders')
const dotenv = require('dotenv');
dotenv.config()


const purchasepremium =async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500;

        rzp.orders.create({amount, currency: "INR"}, (err, order) => {
            if(err) {
                throw new Error(err);
            }
            Order.create({ orderid: order.id, status: 'PENDING'}).then(() => {
                return res.status(201).json({ order, key_id : rzp.key_id});
            }).catch(err => {
                throw new Error(err)
            })
        })
    } catch(err){
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err})
    }
}

 const updateTransactionStatus = (req, res ) => {

    try {
        const { payment_id, order_id} = req.body;
        console.log(req.body)
        console.log("hello vinay , update transacion status")
        Order.findOne({ where: { orderId: order_id } })
            .then(order => {
                order.update({ paymentid: payment_id, status: "SUCCESSFUL" })
                    .then(() => {
                        req.user.update({ispremiumuser: true})  
                            .then(() => {
                                console.log("hello vinay , sending success status")
                                return res.status(202).json({ success: true, message: "Transaction done successfully" })
                            })
                            .catch(err => {
                                Order.update({ paymentId: payment_id, status: "Failed" }, { where: { orderId: order_id } })
                                console.log(err)
                            })
                    })
                    .catch(err => {
                        Order.update({ paymentId: payment_id, status: "Failed" }, { where: { orderId: order_id } })
                        console.log(err)
                    })
            })
            .catch(err => {
                Order.update({ paymentId: payment_id, status: "Failed" }, { where: { orderId: order_id } })
                console.log(err)
            })
    } catch (err) {
        console.log(err);
        res.status(403).json({ errpr: err, message: 'Sometghing went wrong' })
    }
}

module.exports = {
    purchasepremium,
    updateTransactionStatus
}