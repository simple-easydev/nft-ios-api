const db = require('./db');
const { DataTypes } = require("sequelize");
const { Post } = require('./posts');

const Auction = db.sequelize.define('auction', {
    nft_id: {
        type: DataTypes.INTEGER
    },
    owner_id: {
        type: DataTypes.INTEGER
    },
    auction_address: {
        type: DataTypes.CHAR
    },
    min_price: {
        type: DataTypes.DECIMAL(50, 20)
    },
    expire_date: {
        type: DataTypes.CHAR
    },
    end: {
        type: DataTypes.BOOLEAN
    }
}, { freezeTableName:true, timestamps: false });

Auction.belongsTo(Post, {foreignKey:"nft_id"});
Post.hasOne(Auction, {foreignKey:"nft_id"});

module.exports.Auction = Auction;