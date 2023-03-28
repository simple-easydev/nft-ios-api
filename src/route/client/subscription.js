const controller = require('controllers/subscription');
const validator = require('controllers/subscription/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.post("/", [trimRequest.all, authenticateToken, validator.createSubscription], controller.createSubscription);

router.get("/:user_id", [trimRequest.all, authenticateToken], controller.getSubscriptionState);

 exports.default = router;