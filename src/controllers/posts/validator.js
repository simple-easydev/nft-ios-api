
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');


/**
 * get all Posts
 */
 exports.getAll = [
    check('offset'),
    check('limit'),
    check('query'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

/**
 * create a post
 */
 exports.create = [
    check('post_title')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('post_description'),
    check('category_id'),
    check('sub_category_id'),
    check('price'),
    check('tags'),
    check('tag_users'),
    check('tag_event'),
    check('media_url') // temp path url
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('thumbnail_url'), // temp path url
    check('media_type_id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('location'),
    check('location_review'),
    check('event_id'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 * upate a post
 */

 exports.update = [
    check('post_title')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 * Create a comment
 */
exports.createComment = [
    check('content')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 * Create a comment
 */
 exports.updateComment = [
    check('content')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 * Get Comments in pagination
 */
 exports.getComments = [
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

/**
 * Get Posts nearby
 */
 exports.getPostNearBy = [
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
    check('sub_category_id'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.getPostNearByWithPOI = [
    check('limit')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('offset')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('poi')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('category_id'),
    check('sub_category_id'),
    check('lat'),
    check('lng'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

/**
 * Update Post NFT Token
 */
exports.updateNFTToken = [
    check('post_id')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('nft_token')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('collection_symbol')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('collection_address')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

exports.updateNFTSaleState = [
    check('post_id')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    check('on_sale')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]
exports.updateNFTOwner = [
    check('post_id')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

exports.createNFTPost = [
    check('media_url').exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('thumbnail_url').exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('post_title')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('media_type_id'),
    check('category_id'),
    check('price'),
    check('nft_properties'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.getNFTPostsByCategory = [
    check('category_id'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.getNFTPostsByUser = [
    check('user_id'),
    check('type'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.testSend = [
    check('toAddress'),
    check('amount'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.createCollection = [
    check('name').exists()
        .withMessage('MISSING'),
    check('description').exists()
        .withMessage('MISSING'),
    check('media_url').exists()
        .withMessage('MISSING'),
    check('symbol').exists()
        .withMessage('MISSING'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.setPrice = [
    check('price').exists()
        .withMessage('MISSING'),
    check('post_id').exists()
        .withMessage('MISSING'),
    check('price_address').exists()
        .withMessage('MISSING'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

exports.searchExplore = [
    check('category'),
    check('text'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.searchFollowing = [
    check('text'),
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
];

exports.updatePremium = [
    check('post_id'),
    check('is_premium'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 * create a post
 */
//  exports.createDraft = [
//     check('post_description'),
//     check('category_id'),
//     check('sub_category_id'),
//     check('tags'),
//     check('tag_users'),
//     check('tag_event'),
//     check('media_url') // temp path url
//         .exists()
//         .withMessage('MISSING')
//         .not()
//         .isEmpty()
//         .withMessage('IS_EMPTY'),
//     check('thumbnail_url'), // temp path url
//     check('media_type_id')
//         .exists()
//         .withMessage('MISSING')
//         .not()
//         .isEmpty()
//         .withMessage('IS_EMPTY'),
//     check('location'),
//     (req, res, next) => {
//         validationResult(req, res, next);
//     }
// ]

// /**
//  * upate a post
//  */

//  exports.updateDraft = [
//     check('post_description'),
//     check('category_id'),
//     check('sub_category_id'),
//     check('tags'),
//     check('tag_users'),
//     check('tag_event'),
//     check('message_users'),
//     check('media_url') // temp path url
//         .exists()
//         .withMessage('MISSING')
//         .not()
//         .isEmpty()
//         .withMessage('IS_EMPTY'),
//     check('thumbnail_url'), // temp path url
//     check('media_type_id')
//         .exists()
//         .withMessage('MISSING')
//         .not()
//         .isEmpty()
//         .withMessage('IS_EMPTY'),
//     check('location'),
//     (req, res, next) => {
//         validationResult(req, res, next);
//     }
// ]