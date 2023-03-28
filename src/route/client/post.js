const controller = require('controllers/posts');
const validator = require('controllers/posts/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.get('/all', [trimRequest.all, authenticateToken, validator.getAll], controller.getAll);
router.get('/category', [trimRequest.all, authenticateToken, validator.getAll], controller.getPostByCategory);
router.get('/tags/:tag_name', [trimRequest.all, authenticateToken, validator.getAll], controller.getPostByTag)
router.get('/follwers', [trimRequest.all, authenticateToken, validator.getAll], controller.getPostsFromFollowers);
router.get('/popularPostByCategory', [trimRequest.all, authenticateToken, validator.getAll], controller.popularPostByCategory);

router.get('/detail/:id', [trimRequest.all, authenticateToken], controller.getPostDetail);

router.post('/', [trimRequest.all, authenticateToken, validator.create], controller.create);
router.put('/:id', [trimRequest.all, authenticateToken, validator.update], controller.update);
router.delete('/:id', [trimRequest.all, authenticateToken], controller.delete);

// draft post
// router.post('/draft/', [trimRequest.all, authenticateToken, validator.createDraft], controller.createDraft);
// router.put('/draft/:id', [trimRequest.all, authenticateToken, validator.updateDraft], controller.updateDraft);

//like post
router.put('/:id/like', [trimRequest.all, authenticateToken], controller.likePost);
router.put('/:id/unlike', [trimRequest.all, authenticateToken], controller.unLikePost);

//collect post
router.put('/:id/collect', [trimRequest.all, authenticateToken], controller.collectPost);
router.put('/:id/uncollect', [trimRequest.all, authenticateToken], controller.unCollectPost);

//Leave comment
router.post('/:id/comments', [trimRequest.all, authenticateToken, validator.createComment ], controller.createComment);
router.put('/comments/:id', [trimRequest.all, authenticateToken, validator.updateComment], controller.updateComment);
router.delete('/comments/:id', [trimRequest.all, authenticateToken], controller.deleteComment);
router.get('/:post_id/comments', [trimRequest.all, authenticateToken, validator.getComments], controller.getComments);
router.put('/comments/:id/reply', [trimRequest.all, authenticateToken, validator.createComment], controller.replyComment);
router.get('/comments/:comment_id/replies', [trimRequest.all, authenticateToken, validator.getComments], controller.getReplies);

//like comment
router.put('/comments/:id/like', [trimRequest.all, authenticateToken], controller.likeComment);
router.put('/comments/:id/unlike', [trimRequest.all, authenticateToken], controller.unLikeComment);

router.get('/options/all', [trimRequest.all, authenticateToken], controller.getTagsTagUsersMediaTypes);


//get near by posts
router.post('/location/nearBy', [trimRequest.all, authenticateToken, validator.getPostNearBy], controller.getNearByPosts);
router.post('/location/nearBy/poi', [trimRequest.all, authenticateToken, validator.getPostNearByWithPOI], controller.getNearByPostsWithPOI);

//get event posts
router.get('/event/:event_id', [trimRequest.all, authenticateToken], controller.getEventPosts);

// router.get('/topic/all', [trimRequest.all, authenticateToken, validator.getPostByTopic], controller.getPostByTopic);
// router.get('/nft/topic', [trimRequest.all, authenticateToken, validator.getNftByTopic], controller.getNftByTopic)

// search posts
router.get('/search/explore', [trimRequest.all, authenticateToken, validator.searchExplore], controller.searchExplorePosts);
router.get('/search/following', [trimRequest.all, authenticateToken, validator.searchFollowing], controller.searchFollowingPosts);

// get nft metadata
router.get('/metadata/:token', [trimRequest.all], controller.getNFTMetadata);
router.get('/getNFTPostsByCategory', [trimRequest.all, authenticateToken, validator.getNFTPostsByCategory], controller.getNFTPostsByCategory);
router.get('/getNFTPostsByUser', [trimRequest.all, authenticateToken, validator.getNFTPostsByUser], controller.getNFTPostsByUser);

router.post('/updateNFTToken', [trimRequest.all, authenticateToken, validator.updateNFTToken], controller.updateNFTToken);
router.post('/updateNFTSaleState', [trimRequest.all, authenticateToken, validator.updateNFTSaleState], controller.updateNFTSaleState);
router.post('/updateNFTOwner', [trimRequest.all, authenticateToken, validator.updateNFTOwner], controller.updateNFTOwner);

router.post('/createNFTPost', [trimRequest.all, authenticateToken, validator.createNFTPost], controller.createNFTPost);

// get rella coin total balance
router.get('/rellacoin/balance/:holder', [trimRequest.all], controller.getRellaCoinBalance);
router.post('/rellacoin/testSend', [trimRequest.all, authenticateToken, validator.testSend], controller.testSend);

// collection
router.post('/collection', [trimRequest.all, authenticateToken, validator.createCollection], controller.createCollection);

// nft set sale
router.put('/nft/price', [trimRequest.all, authenticateToken, validator.setPrice], controller.setPrice);

// post premium
router.post('/premium', [trimRequest.all, authenticateToken, validator.updatePremium], controller.updatePremium);
router.get('/premium/:user_id', [trimRequest.all, authenticateToken], controller.getPremiumPosts);

exports.default = router;