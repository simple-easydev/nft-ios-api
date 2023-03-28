
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');

/**
 * create auction
 */
 exports.createSubscription = [
    check('user_id'),
    check('expire_date'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
 ]