const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');
const { DataTypes } = require("sequelize");

const MediaType = db.sequelize.define('media_types', {
    type_name: {
        type:DataTypes.CHAR
    }
}, { freezeTableName:true })

const Media = db.sequelize.define('medias', {
    media_url: {
        type: DataTypes.TEXT
    },
    metadata: {
        type: DataTypes.JSON
    },
    media_type_id: {
        type: DataTypes.BIGINT,
        references:{
            model: MediaType,
            key:'id'
        }
    },
    thumbnail_url: {
        type: DataTypes.TEXT,
    }
}, { freezeTableName:true });

MediaType.hasMany(Media, { foreignKey: "media_type_id"});
Media.belongsTo(MediaType, { foreignKey: "media_type_id"});

module.exports.Media = Media;
module.exports.MediaType = MediaType;