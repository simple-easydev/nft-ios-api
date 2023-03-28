const controller = require('controllers/auth');
const validator = require('controllers/auth/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');


/*
 * Login routes
 */
router.post('/login', [trimRequest.all, validator.login], controller.login);
router.post('/signup', [trimRequest.all, validator.signup], controller.signup);
router.post('/userByWallet', [trimRequest.all, validator.userByWallet], controller.userByWallet);
router.post('/emailVerify', [trimRequest.all, validator.emailVerify], controller.emailVerify);
router.post('/resendMail', [trimRequest.all, validator.resendMail], controller.resendMail);
router.post('/forgotPassword', [trimRequest.all, validator.forgotPassword], controller.forgotPassword);
router.post('/resetPassword', [trimRequest.all, validator.resetPassword], controller.resetPassword);

router.post("/phone_number/register", [trimRequest.all, authenticateToken, validator.registerPhoneNumber], controller.registerPhoneNumber);
router.post("/phone_number/verify", [trimRequest.all, authenticateToken, validator.verifyPhoneNumber], controller.verifyPhoneNumber);

exports.default = router;
