const controller = require('controllers/search');
const validator = require('controllers/search/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get('/topic', [trimRequest.all, authenticateToken, validator.searchTopic], controller.searchTopic);
router.get('/topic/discover', [trimRequest.all, authenticateToken], controller.discoverTopic);
router.get('/topic/trends', [trimRequest.all, authenticateToken], controller.getTrendsTopic);

router.get('/post/topic', [trimRequest.all, authenticateToken, validator.getPostByTopic], controller.getPostByTopic);
router.get('/nft/topic', [trimRequest.all, authenticateToken, validator.getNftByTopic], controller.getNftByTopic)
router.get("/user/topic", [trimRequest.all, authenticateToken, validator.getUserByTopic], controller.getUsersTopic);


exports.default = router;