
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');

 /**
 * Search Topic
 */
  exports.report = [
    check('category_id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('description'),
    check('screenshot_url'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];