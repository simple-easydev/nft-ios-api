
const { check } = require('express-validator');
const { validationResult } = require('middleware/utils');

/**
 * update user information
 */

 exports.update = [
    check('gender'),
    check('age'),
    check('user_name'),
    check('profile_name'),
    check('twitter_name'),
    check('instagram_name'),
    check('linkedin_name'),
    check('facebook_name'),
    check('birthday'),
    check('avatar_url'),
    check('background_url'),
    check('bio'),
    check('education'),
    check('location'),
    check('entrollment_time'),
    check('university_name'),
    check('email'),
    check('phone_number'),
    check('color'),
    check('intensity'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

/**
 * Follow People
 */

 exports.followPeople = [
    check('follower_id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('is_follow')
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
 * block a user
 */

exports.blockUser = [
    check('user_id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    check('is_block')
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
 * update notification setting
 */

exports.updateNotificationSetting = [
    check('push_token'),
    check('receive_message'),
    check('receive_like'),    
    check('receive_follower'),    
    check('receive_comment'),    
    check('receive_chat'),    
    check('receive_post'),    
    check('recommend_people'),    
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

exports.updateUserStatus = [
    check('status'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]

exports.getUserNotifications = [
    check('offset'),
    check('limit'),
    (req, res, next) => {
        validationResult(req, res, next);
    }
]