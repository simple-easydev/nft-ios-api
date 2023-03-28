const controller = require('controllers/support');
const validator = require('controllers/support/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.post('/report', [trimRequest.all, authenticateToken, validator.report], controller.report);


exports.default = router;