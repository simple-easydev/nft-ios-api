const controller = require('controllers/posts');
const validator = require('controllers/posts/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get("/all", [trimRequest.all, authenticateToken, validator.getAll], controller.getAll);

exports.default = router;