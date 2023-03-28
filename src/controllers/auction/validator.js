
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');

/**
 * create auction
 */
 exports.create = [
    check('nft_id'),
    check('auction_address'),
    check('min_price'),
    check('expire_date'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
 ]

 exports.update = [
    check('nft_id'),
    check('auction_address'),
    check('min_price'),
    check('expire_date'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
 ]
 
 exports.auctionEnd = [
    check('nft_id'),
    check('auction_id'),
    check('bidder_id'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
 ]

/**
 * create auction bid
 */
 exports.createBid = [
    check('auction_id'),
    check('nft_id'),
    check('amount'),
    check('date'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
 ]