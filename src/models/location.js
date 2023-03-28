const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');
const { DataTypes } = require("sequelize");

const Location = db.sequelize.define('locations', {
    name: {
        type: DataTypes.CHAR
    },
    address: {
        type: DataTypes.CHAR
    },
    poi: {
        type: DataTypes.CHAR
    },
    geo: {
        type: DataTypes.CHAR,

    },
    lat: {
        type: DataTypes.CHAR
    },
    lng: {
        type: DataTypes.TEXT,
    }
}, 
{ 
    freezeTableName:true, 
    timestamps: false 
});

module.exports = Location;