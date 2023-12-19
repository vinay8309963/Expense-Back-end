const Sequelize = require('sequelize');
const sequelize = require('../util/database');

//id, name , password, phone number, role

const files = sequelize.define('downloadedFiles', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    date: Sequelize.DATE,
    fileUrl: Sequelize.STRING,
})

module.exports = files;