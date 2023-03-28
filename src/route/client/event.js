const controller = require('controllers/event');
const validator = require('controllers/event/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.post("/create", [trimRequest.all, authenticateToken, validator.create], controller.create);

router.post("/getEvents", [trimRequest.all, authenticateToken, validator.getEvents], controller.getEvents);
router.get("/search", [trimRequest.all, authenticateToken, validator.search], controller.searchEvents);

 exports.default = router;