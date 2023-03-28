const db = require('./db');
const { DataTypes } = require("sequelize");

const Categories = db.sequelize.define('post_category', {
    name: {
        type: DataTypes.CHAR
    },
    icon: {
        type: DataTypes.CHAR
    },
    active: {
        type: DataTypes.BOOLEAN
    },
    parent_id: {
        type: DataTypes.BIGINT
    },
    type: {
        type: DataTypes.ENUM,
        values: ['post','nft','location', 'event']
    }
}, { freezeTableName:true, timestamps: false });

const SubCategory = db.sequelize.define('post_sub_category', {
    sub_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Categories,
            key: 'id'
        }
    },
    parent_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Categories,
            key: 'id'
        }
    },
}, {freezeTableName:true, timestamps: false});

Categories.belongsToMany(Categories, {as: "Sub_Category", through: SubCategory, foreignKey: "parent_id", otherKey: "sub_id"})

module.exports.SubCategory = SubCategory;
module.exports.Categories = Categories;