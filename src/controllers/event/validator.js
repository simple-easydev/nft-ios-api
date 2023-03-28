
const { validationResult } = require('middleware/utils');
const { check, query} = require('express-validator');

/**
 * Validates register request
 */
exports.create = [
    check('title')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('description')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('event_time')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('media_url') // temp path url
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('thumbnail_url'), // temp path url
    check('media_type_id'),
    check('location'),
    check('ticket_url'),
    check('event_category_id'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.search = [
    check('text')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.getEvents = [
    check('lat')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('lng')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('radius')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('category_id'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]