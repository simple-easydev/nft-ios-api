
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');

 /**
 * Search Topic
 */
  exports.searchTopic = [
    check('query'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];


/**
 * Get posts by topic 
 */

 exports.getPostByTopic = [
    check('topic'),
    check('offset'),
    check('limit'),
    check('category'),
    check('subCategory'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 *  Get NFTs by Topic
 */
exports.getNftByTopic = [
    check('topic'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 *  Get User By topic
 */
exports.getUserByTopic = [
    check('topic'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]