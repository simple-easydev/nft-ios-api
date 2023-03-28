const db = require('./db');
const { DataTypes } = require("sequelize");
const { Post } = require('./posts');
const { Auction } = require('./auction');
const { User } = require('./users');

const AuctionBid = db.sequelize.define('auction_bid', {
    auction_id: {
        type: DataTypes.INTEGER
    },
    nft_id: {
        type: DataTypes.INTEGER
    },
    bidder_id: {
        type: DataTypes.INTEGER
    },
    amount: {
        type: DataTypes.DECIMAL(50, 20)
    },
    date: {
        type: DataTypes.CHAR
    }
}, { freezeTableName:true, timestamps: false });

AuctionBid.belongsTo(User, {as:"bidder", foreignKey:"bidder_id"});
User.hasOne(AuctionBid, {foreignKey: "bidder_id"})

module.exports.AuctionBid = AuctionBid;