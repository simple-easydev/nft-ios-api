const db = require('./db');
const { DataTypes } = require("sequelize");

const Tags = db.sequelize.define('tags', {
    tag_name: {
        type: DataTypes.CHAR
    },
    tag_uri: {
        type: DataTypes.CHAR
    }
}, { freezeTableName:true });

module.exports = Tags;