
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');

/**
 * update user information
 */
 exports.sendNotification = [
    check('playerId'),
    check('subtitle'),
    check('message'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
 ]