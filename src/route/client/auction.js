const controller = require('controllers/auction');
const validator = require('controllers/auction/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get("/detail/:nft_id", [trimRequest.all, authenticateToken], controller.getAuction);
router.put("/", [trimRequest.all, authenticateToken, validator.update], controller.updateAuction);
router.post("/", [trimRequest.all, authenticateToken, validator.create], controller.createAuction);
router.post("/end", [trimRequest.all, authenticateToken, validator.auctionEnd], controller.auctionEnd);

router.get("/:auction_id/bid", [trimRequest.all, authenticateToken], controller.getBidList);
router.post("/bid", [trimRequest.all, authenticateToken, validator.createBid], controller.createBid);

 exports.default = router;