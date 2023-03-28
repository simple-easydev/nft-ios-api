const controller = require('controllers/profile');
const validator = require('controllers/profile/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get("/all", [trimRequest.all, authenticateToken], controller.adminGetAllUsers);

exports.default = router;