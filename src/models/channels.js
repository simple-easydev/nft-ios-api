const db = require('./db');
const { DataTypes } = require("sequelize");

const Channels = db.sequelize.define('channels', {
    channel_name: {
        type: DataTypes.BIGINT
    },
    status: {
        type: DataTypes.BIGINT
    },
    channel_uri: {
        type: DataTypes.CHAR
    },
    icon_url: {
        type: DataTypes.TEXT
    },
    isInterest: {
        type: DataTypes.BOOLEAN
    },
}, { freezeTableName:true });

module.exports = Channels;