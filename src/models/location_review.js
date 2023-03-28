const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { DataTypes } = require("sequelize");

const LocationReview = db.sequelize.define('location_review', {
    location_id: {
        type: DataTypes.INTEGER
    },
    post_id: {
        type: DataTypes.INTEGER
    },
    category_id: {
        type: DataTypes.INTEGER
    },
    sub_category_id: {
        type: DataTypes.INTEGER,

    },
    review: {
        type: DataTypes.SMALLINT
    }
}, 
{ 
    freezeTableName:true, 
    timestamps: false 
});

module.exports = LocationReview;