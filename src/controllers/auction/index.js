const { matchedData } = require('express-validator');

const { Post, PostCollects, PostLikes } = require('models/posts');
const { User, Friends } = require('models/users');

const { Sequelize } = require('sequelize');
const { sendPushNotification } = require('helper/notification');
const { Auction } = require('models/auction');
const { AuctionBid } = require('models/auctionbid');
const Op = Sequelize.Op;

exports.createAuction = async (req, res) => {

    const { id } = req.user;
    const data = matchedData(req);

    try {
        const auction = await Auction.create({ ...data, owner_id: id });

        const post = await Post.findByPk(auction.nft_id);
        post.on_sale = true;
        post.save();

        res.status(200).json(auction);

    }catch(error){
        res.status(401).json({ error });
    }

}

exports.getAuction = async (req, res) => {

    const { nft_id } = req.params;

    try {
        const auction = await Auction.findOne({
            where: { nft_id }
        })
        res.status(200).json(auction);
    } catch (error) {
        res.status(401).json({ error });
    }

}

exports.updateAuction = async (req, res) => {

    const { id } = req.user;
    const data = matchedData(req);

    try {
        const auction = await Auction.findOne({
            where: { nft_id: data.nft_id, owner_id: id }
        });
        if (auction) {
            auction.min_price = data.min_price;
            auction.expire_date = data.expire_date;

            auction.save();
            
            res.status(200).json(auction);
        } else {
            res.status(403).json({ "error": "forbidden" });
        }
    } catch (error) {
        res.status(401).json({ error });
    }

}

exports.createBid = async (req, res) => {
    const { id } = req.user;
    const data = matchedData(req);

    try {
        const auction = await Auction.findOne({
            where: {
                id: { [Op.eq]: data.auction_id }, 
                end : false
            }
        });

        if (auction) {

            const bid = await AuctionBid.create({ ...data, bidder_id: id });
            res.status(200).json(bid);
        
        } else {
            res.status(403).json({"error" : "Auction is end"});
        }

    }catch(error){
        res.status(401).json({ error });
    }

}

exports.getBidList = async (req, res) => {
    const { auction_id } = req.params;
    try {
        const bids = await AuctionBid.findAll({
            where: {
                auction_id
            },
            include: {
                attributes:['user_name', 'avatar_url', 'wallet_address'],
                model: User,
                as: "bidder"
            },
            order: [["amount", 'DESC']]
        })
        
        res.status(200).json(bids);
    }catch(error){
        res.status(401).json({ error });
    }
}

exports.auctionEnd = async (req, res) => {
    const { id } = req.user;
    const { nft_id, bidder_id, auction_id } = matchedData(req);

    try {
        const auction = await Auction.findByPk(auction_id);
        auction.end = true;
        auction.save();

        const nft = await Post.findByPk(nft_id);
        nft.on_sale = false

        if (bidder_id) {
            nft.owner_id = bidder_id;
        }

        nft.save();
        res.status(200).json({ message: "success" });
    }catch(error){
        res.status(401).json({ error });
    }
}