const controller = require('controllers/profile');
const validator = require('controllers/profile/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get("/", [trimRequest.all, authenticateToken], controller.getMyProfileDetail)
router.put('/', [trimRequest.all, authenticateToken, validator.update], controller.update);
router.get('/channels', [trimRequest.all, authenticateToken], controller.getAllChannels);
router.post('/follow', [trimRequest.all, authenticateToken, validator.followPeople], controller.followPeople);
router.get('/users', [trimRequest.all, authenticateToken], controller.getRecommenedUsers);
router.get('/users/all', [trimRequest.all, authenticateToken], controller.getAllUsers);
router.get("/posts/bycategory", [trimRequest.all, authenticateToken],  controller.getProfilePostsByUserAndCategory);
router.get("/posts/:profile_action_type", [trimRequest.all, authenticateToken],  controller.getProfilePosts);
router.get("/posts/:user_id/:profile_action_type", [trimRequest.all, authenticateToken],  controller.getProfilePostsByUser);
router.get("/detail/:user_id", [trimRequest.all, authenticateToken], controller.getProfileDetail);

router.get("/followers", [trimRequest.all, authenticateToken], controller.getFollowers);
router.get("/followings", [trimRequest.all, authenticateToken], controller.getFollowings);
router.get("/followers/:user_id", [trimRequest.all, authenticateToken], controller.getOtherFollowers);
router.get("/followings/:user_id", [trimRequest.all, authenticateToken], controller.getOtherFollowings);

router.post("/blockUser", [trimRequest.all, authenticateToken, validator.blockUser], controller.blockUser);
router.get("/blockUsers", [trimRequest.all, authenticateToken], controller.getAllBlockedUsers);
router.get("/getNotificationSetting", [trimRequest.all, authenticateToken], controller.getNotificationSetting);
router.put("/updateNotificationSetting", [trimRequest.all, authenticateToken, validator.updateNotificationSetting], controller.updateNotificationSetting)

router.get("/status/:user_id", [trimRequest.all, authenticateToken], controller.getUserStatus);
router.post("/updateUserStatus", [trimRequest.all, authenticateToken, validator.updateUserStatus], controller.updateUserStatus);

router.get("/userNotifications", [trimRequest.all, authenticateToken, validator.getUserNotifications], controller.getUserNotifications);

 exports.default = router;