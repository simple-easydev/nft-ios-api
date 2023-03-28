const db = require('./db');
const { DataTypes } = require("sequelize");

const Subscription = db.sequelize.define('subscription', {
    user_id: {
        type: DataTypes.INTEGER
    },
    subscriber_id: {
        type: DataTypes.INTEGER
    },
    expire_date: {
        type: DataTypes.CHAR
    }
}, { freezeTableName:true, timestamps: false });

module.exports.Subscription = Subscription;