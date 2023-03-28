const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { DataTypes } = require("sequelize");
const { Media } = require('./media');
const Location = require('./location');
const { Categories } = require('./categories');

const Event = db.sequelize.define('events', {
    title: {
        type: DataTypes.CHAR
    },
    description: {
        type: DataTypes.TEXT
    },
    event_time: {
        type: DataTypes.CHAR
    },
    media_id: {
        type: DataTypes.INTEGER
    },
    location_id: {
        type: DataTypes.INTEGER
    },
    ticket_url: {
        type: DataTypes.CHAR
    },
    event_category_id: {
        type: DataTypes.INTEGER,

    }
}, 
{ 
    freezeTableName:true, 
    timestamps: false 
});

Event.belongsTo(Media, { foreignKey: "media_id" });
Media.hasMany(Event, { foreignKey: 'media_id' });

Event.belongsTo(Location, {foreignKey:"location_id"});
Location.hasOne(Event, {foreignKey:"location_id"});

Event.belongsTo(Categories, {foreignKey: "event_category_id" });
Categories.hasMany(Event, { foreignKey: "event_category_id" });

module.exports.Event = Event;