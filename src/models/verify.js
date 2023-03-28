const db = require('./db');
const _ = require("lodash");
const { DataTypes } = require("sequelize");

const Verify = db.sequelize.define('user_verify', {
    email: {
        type: DataTypes.CHAR
    },
    code: {
        type: DataTypes.CHAR
    }
}, 
{ 
    freezeTableName:true, 
});

module.exports = Verify;