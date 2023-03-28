const controller = require('controllers/auth');
const validator = require('controllers/auth/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

/*
* admin auth
*/
router.post('/admin/login', [trimRequest.all, validator.adminLogin], controller.adminLogin);
router.post('/admin/loginByToken', [trimRequest.all, authenticateToken], controller.adminLoginByToken);
router.post('/admin/register', [trimRequest.all, validator.adminRegister], controller.adminRegister);

exports.default = router;
