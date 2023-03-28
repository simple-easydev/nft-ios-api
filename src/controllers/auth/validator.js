
const { validationResult } = require('middleware/utils');
const { check, query} = require('express-validator');

/**
 * Validates register request
 */
exports.signup = [
    check('user_name')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('wallet_address')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('email')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('password')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('push_token'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.userByWallet = [
    check('wallet_address')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.emailVerify = [
    check('email')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('code')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.login = [
    check('user_name'),
    check('email'),
    check('password'),
    check('push_token'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.resendMail = [
    check('to'),
    check('type'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];


exports.forgotPassword = [
    check('email'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.resetPassword = [
    check('email'),
    check('code'),
    check('password'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.registerPhoneNumber = [
    check('phone_number')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('profile_name')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

exports.verifyPhoneNumber = [
    check('request_id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('code')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/* admin validator */
exports.adminLogin = [
    check('user_name'),
    check('email'),
    check('password'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.adminRegister = [
    check('user_name'),
    check('email'),
    check('password'),
    check('role'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];