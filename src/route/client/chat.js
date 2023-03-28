const controller = require('controllers/chat');
const validator = require('controllers/chat/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get("/friends", [trimRequest.all, authenticateToken], controller.getFriends);
router.get("/likesandcollects", [trimRequest.all, authenticateToken], controller.getLikesAndCollects);
router.get("/commenters", [trimRequest.all, authenticateToken], controller.getCommenters);
router.get("/followers", [trimRequest.all, authenticateToken], controller.getFollowers);
router.post("/notification", [trimRequest.all, authenticateToken, validator.sendNotification], controller.sendNotification);

 exports.default = router;