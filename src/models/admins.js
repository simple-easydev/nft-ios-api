const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');

const { DataTypes } = require("sequelize");

const Admin = db.sequelize.define('admins', {
    user_name: {
        type: DataTypes.CHAR
    },
    email: {
        type: DataTypes.CHAR
    },
    password: {
        type: DataTypes.TEXT
    },
    user_token: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('active','suspended','pending'),
        defaultValue:"pending"
    },
}, { freezeTableName:true });

Admin.prototype.checkPassword = async function (password) {
    const isPasswordMatch = await auth.checkPassword(password, this.password);
    return isPasswordMatch;
}

Admin.prototype.isExistEmail = function (email) {
    return email == this.email;
}

Admin.prototype.isExistUsername = function (username) {
    return username == this.user_name
}

Admin.prototype.generateNewToken = async function () {
    const user_token = generateUserToken(this);
    this.user_token = user_token;
    await this.save();
    return this;
}


module.exports.Admin = Admin;