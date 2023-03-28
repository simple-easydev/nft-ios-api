const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');
const { User } = require("./users");

const { DataTypes } = require("sequelize");

const ReportCategory = db.sequelize.define('report_caregories', {
    cartegory:{
        type:DataTypes.CHAR
    }
}, {freezeTableName:true, timestamps:false})

const Reports = db.sequelize.define('report_contents', {
    description: {
        type: DataTypes.TEXT
    },
    screenshot_url: {
        type: DataTypes.TEXT,
    },
    category_id: {
        type: DataTypes.BIGINT,
        references: {
            model: ReportCategory,
            key: 'id'
        }
    },
    reporter_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {freezeTableName:true});

ReportCategory.hasMany(Reports, { foreignKey:"category_id" })
Reports.belongsTo(ReportCategory, { as:"Category",  foreignKey:"category_id" })


User.hasMany(Reports, { foreignKey:"reporter_id" })
Reports.belongsTo(User, { as:"Reporter",  foreignKey:"reporter_id" })

module.exports.Reports = Reports;
