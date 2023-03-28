const { matchedData } = require('express-validator');

const { Post, TagPosts, PostCollects, PostLikes } = require('models/posts');
const { User, Friends, BlockList, NotificationSetting } = require('models/users');
const Tags = require('models/tags');
const Location = require('models/location');
const { Comment } = require('models/comments');
const Channels = require('models/channels');
const { Media, MediaType } = require('models/media');

const { moveTempFileToUpload } = require('helper/file');
const { sendPushNotification } = require('helper/notification');

const { generateUriFromString } = require("helper");
const { Sequelize, QueryTypes } = require('sequelize');
const { sequelize } = require('models/db');
const { Categories } = require('models/categories');

const moment = require("moment");
const Op = Sequelize.Op;

exports.getAllChannels = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findByPk(id);
        const channels = await user.getChannels({ 
            attributes:{
                exclude:["createdAt", "updatedAt"]
            },
            joinTableAttributes: [],
        });
        const allChannels = await Channels.findAll({ 
            attributes:{
                exclude:["createdAt", "updatedAt"]
            },
        });
        res.status(200).json({ selected: channels, all: allChannels });
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.update = async (req, res) => {

    const { id } = req.user;
    const data = matchedData(req);

    try {

        if(data.avatar_url){
            data.avatar_url = await moveTempFileToUpload(data.avatar_url)
        }
        if(data.background_url){
            data.background_url = await moveTempFileToUpload(data.background_url)
        }

        const user = await User.findByPk(id);
        user.set(data);
        await user.save();
        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        await user.destroy();
        res.status(200).json({ result });
    }catch(err){
        res.status(401).json({ err });
    }
}

exports.followPeople = async (req, res) => {
    const { id } = req.user;
    const { follower_id, is_follow } = matchedData(req);
    try {
        let isFriend = false;

        const user = await User.findByPk(id);
        const oppositeUser = await User.findByPk(follower_id, {
            include: {
                model: NotificationSetting
            }
        });
        const followers = await oppositeUser.getFollowers({ attributes: ["id"], joinTableAttributes:[]});
        const fIds = followers.map((ele)=>ele.id);
        if(fIds.includes(id)){
            isFriend = true;
        }
        if(is_follow){
            if(isFriend){
                await user.addFriends(follower_id);
            }
            await user.addFollower(follower_id);

            if (oppositeUser.notification_setting.receive_follower && oppositeUser.notification_setting.push_token) {
                const playerIds = [oppositeUser.notification_setting.push_token];
                data = {
                    title: "NFTSocial",
                    subtitle: "You've got a follower",
                    message: user.user_name + " is following you",
                    action: "follow"
                }
                const pushId = await sendPushNotification(playerIds, data);
            }

        }else{
            if(isFriend){
                await user.removeFriends(follower_id);
            }
            await user.removeFollower(follower_id);
        }
        res.status(200).json({message:"success"});
    }catch(error){
        res.status(501).json({error: error.message});
    }
}

exports.getRecommenedUsers = async (req, res) => {
    const { id } = req.user;

    const postCount = [Sequelize.literal(`(
        SELECT COUNT(*)
        FROM posts
        WHERE
        posts.author_id = users.id
        )`), 'post_counts'];

    try {
        const user = await User.findByPk(id);
        const followers = await user.getFollowers({ attributes: ["id"], joinTableAttributes:[]});
        const fIds = followers.map((ele)=>ele.id);

        const users = await User.findAll({ 
            attributes: {
                include: ['id', "user_name", "wallet_address", "avatar_url", "userId", "gender", "age", "status", "last_online_time", postCount]
            },
            where: {
                id: { [Op.notIn]: [...fIds, id] },
            },
            having: { 'post_counts' : {[Op.gt] : 0} }
        });
        res.status(200).json(users);
    }catch(error){
        console.log(error.message)
        res.status(501).json({error: error.message});
    }
}

exports.getAllUsers = async (req, res) => {
    const { id } = req.user;

    try {

        const users = await User.findAll({ 
            attributes: {
                exclude: ['user_token', "password"]
            },
            where: {
                id: { [Op.not]: id },
                email_verified: true
            }
        });
        res.status(200).json(users);
    }catch(error){
        console.log(error.message)
        res.status(501).json({error: error.message});
    }
}

exports.getProfilePosts = async (req, res) => {
    const { id } = req.user;
    const { profile_action_type } = req.params;
    console.log("userid ==>", id);
    try {
        if(profile_action_type == "likes"){
            const all = await Post.findAndCountAll({
                distinct: true,
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Followers",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostLikes,
                        attributes:[],
                    },
                    where: {
                        id : {
                            [Op.eq]:id
                        }
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
        if(profile_action_type == "collects"){
            const all = await Post.findAndCountAll({
                distinct: true,
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    },
                    where: {
                        id : {
                            [Op.eq]:id
                        }
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
        if(profile_action_type == "general"){
            const all = await Post.findAndCountAll({
                distinct: true,
                where: {
                    author_id: {
                        [Op.eq]: id
                    },
                    is_nft: false,
                    status: "active"
                },
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Followers",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostLikes,
                        attributes:[],
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    },
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
        if(profile_action_type == "draft"){
            const all = await Post.findAndCountAll({
                distinct: true,
                where: {
                    author_id: {
                        [Op.eq]: id
                    },
                    status: "draft"
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getProfilePostsByUser = async (req, res) => {
    const { id } = req.user;
    const { user_id, profile_action_type } = req.query;
    try {
        if(profile_action_type == "likes"){
            const all = await Post.findAndCountAll({
                distinct: true,
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Followers",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostLikes,
                        attributes:[],
                    },
                    where: {
                        id : {
                            [Op.eq]:user_id
                        }
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
        if(profile_action_type == "collects"){
            const all = await Post.findAndCountAll({
                distinct: true,
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    },
                    where: {
                        id : {
                            [Op.eq]:user_id
                        }
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
        if(profile_action_type == "general"){
            const all = await Post.findAndCountAll({
                distinct: true,
                where: {
                    author_id: {
                        [Op.eq]: user_id
                    },
                    price: 0,
                },
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Followers",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostLikes,
                        attributes:[],
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    },
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
        if(profile_action_type == "nfts"){
            const all = await Post.findAndCountAll({
                distinct: true,
                where: {
                    author_id: {
                        [Op.eq]: user_id
                    },
                    price: {
                        [Op.gt]: 0
                    }
                },
                attributes: {
                    include:[
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isLiked'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id AND user_id = ${user_id}
                        )`), 'isCollected'],
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.post_id = posts.id
                        )`), 'collects_counts'],
    
                        [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id
                        )`), 'comments_counts']
                    ],
                },
                include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    as:"Followers",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostLikes,
                        attributes:[],
                    }
                },
                {
                    model:User,
                    as:"Collectors",
                    attributes:["id", "user_name", "profile_name", "userID"],
                    through: {
                        model:PostCollects,
                        attributes:[],
                    },
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                }
            ]});
            res.status(200).json(all);
        }
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getProfileDetail = async (req, res) => {
    const { id } = req.user;
    const { user_id } = req.params;
    try {
        const user = await User.findByPk(user_id, {
            exclude: ["user_token", "password"],
            attributes: {
                include: [
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM followers
                        WHERE
                        followers.user_id = ${user_id}
                        )`), 'followers_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM followers
                        WHERE
                        followers.follower_id = ${user_id}
                        )`), 'following_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.user_id = ${user_id}
                        )`), 'likes_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.user_id = ${user_id}
                        )`), 'collects_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM posts
                        WHERE
                        posts.owner_id = ${user_id}
                        and NOT (is_nft=true and nft_token is null)
                        )`), 'art_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM posts
                        WHERE
                        posts.owner_id = ${user_id} and is_nft=true
                        and NOT (is_nft=true and nft_token is null)
                        )`), 'nft_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM posts
                        WHERE
                        posts.author_id = ${user_id} and is_nft=false
                        and NOT (is_nft=true and nft_token is null)
                        )`), 'post_cnt'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = ${user_id} AND user_id = ${id})`), 'isFollowing']
                ]
            },
            include: {
                model:NotificationSetting
            }
        });
        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getMyProfileDetail = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findByPk(id, {
            exclude: ["user_token", "password"],
            attributes: {
                include: [
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM followers
                        WHERE
                        followers.user_id = ${id}
                        )`), 'followers_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM followers
                        WHERE
                        followers.follower_id = ${id}
                        )`), 'following_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.user_id = ${id}
                        )`), 'likes_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_collects
                        WHERE
                        post_collects.user_id = ${id}
                        )`), 'collects_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM posts
                        WHERE
                        posts.owner_id = ${id}
                        and NOT (is_nft=true and nft_token is null)
                        )`), 'art_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM posts
                        WHERE
                        posts.owner_id = ${id} and is_nft=true
                        and NOT (is_nft=true and nft_token is null)
                        )`), 'nft_cnt'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM posts
                        WHERE
                        posts.author_id = ${id} and is_nft=false
                        and NOT (is_nft=true and nft_token is null)
                        )`), 'post_cnt']
                ]
            },
            include: {
                model:NotificationSetting
            }
        });
        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getFollowers = async (req, res) => {

    const { id } = req.user;

    try {
        const user = await User.findByPk(id);
        const followers = await user.getFollowers({
            attributes:["id", 'user_name', 'userID', 'avatar_url', 'profile_name', 'status', 
            [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = id AND user_id = ${id})`), 'isFollowing']],
            joinTableAttributes:[]
        });
        res.status(200).json(followers);
    }catch(error){
        res.status(501).json({ error });
    }
}

exports.getFollowings = async (req, res) => {

    const { id } = req.user;

    try {
        const user = await User.findByPk(id);
        const followings = await user.getUsers({
            attributes:["id", 'user_name', 'userID', 'avatar_url', 'profile_name', 'status',
            [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = id AND user_id = ${id})`), 'isFollowing']],
            joinTableAttributes:[]
        });
        res.status(200).json(followings);
    }catch(error){
        res.status(501).json({ error });
    }
}

exports.getOtherFollowers = async (req, res) => {

    const { id } = req.user;
    const { user_id } = req.params;

    console.log("called other followers");

    try {
        const user = await User.findByPk(user_id);
        const followers = await user.getFollowers({
            attributes:["id", 'user_name', 'userID', 'avatar_url', 'profile_name', 'status', 
            [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = id AND user_id = ${id})`), 'isFollowing']],
            joinTableAttributes:[]
        });
        res.status(200).json(followers);
    }catch(error){
        console.log(error);
        res.status(501).json({ error });
    }
}

exports.getOtherFollowings = async (req, res) => {

    const { id } = req.user;
    const { user_id } = req.params;

    try {
        const user = await User.findByPk(user_id);
        const followings = await user.getUsers({
            attributes:["id", 'user_name', 'userID', 'avatar_url', 'profile_name', 'status',
            [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = id AND user_id = ${id})`), 'isFollowing']],
            joinTableAttributes:[]
        });
        res.status(200).json(followings);
    }catch(error){
        res.status(501).json({ error });
    }
}

exports.blockUser = async (req, res) => {

    const { id } = req.user;
    const { user_id, is_block } = matchedData(req);

    try {

        const user = await User.findByPk(id);
        if(is_block){
            await user.addBlockedUsers(user_id);
        }else{
            await user.removeBlockedUsers(user_id);
        }

        const blockedUsers = await user.getBlockedUsers({
            attributes: ['id', "user_name", "wallet_address", "avatar_url", "userId", "gender", "age"]
        });

        res.status(200).json(blockedUsers);

    }catch(error){

        res.status(501).json({ error })
    }
}

exports.getAllBlockedUsers = async (req, res) => {

    const { id } = req.user;

    try {

        const user = await User.findByPk(id);
        const blockedUsers = await user.getBlockedUsers({
            attributes: ['id', "user_name", "wallet_address", "avatar_url", "userId", "gender", "age"]
        });

        res.status(200).json(blockedUsers);

    }catch(error){

        res.status(501).json({ error })
    }
}


// notification setting
exports.getNotificationSetting = async (req, res) => {

    const { id } = req.user;

    try {

        const notificationSetting = await NotificationSetting.findOne({
            where: {
                user_id: id
            }
        })
        if (!notificationSetting) {
            // Item not found, create a new one
            const item = await NotificationSetting.create({
                user_id: id,
                push_token: "",
                receive_message: 1,
                receive_like: 1,
                receive_follower: 1,
                receive_comment: 1,
                receive_chat: 1,
                receive_post: 1,
                recommend_people: 1,
            })
            res.status(200).json(item);
        } else {
            res.status(200).json(notificationSetting);
        }

    }catch(error){

        res.status(501).json({ error })
    }
}

exports.updateNotificationSetting = async (req, res) => {
    const { id } = req.user;
    const data = matchedData(req);
    console.log("data ==> ", data)

    try {
        const foundItem = await NotificationSetting.findOne({
            where: {
                user_id: id
            }
        });        

        foundItem.set(data)
        
        await foundItem.save()
        console.log("founditem ==> ", foundItem)
        res.status(200).json(foundItem);

    } catch(err) {
        console.log(err);
        res.status(401).json({ err });
    }


}

exports.getUserStatus = async (req, res) => {
    const { id } = req.user;
    const { user_id } = req.params;
    try {
        const foundItem = await User.findByPk(id, {
            attributes: ["status"]
        });

        res.status(200).json(foundItem);
    } catch(err) {
        res.status(401).json({ err });
    }
}

exports.updateUserStatus = async (req, res) => {
    const { id } = req.user;
    const { status } = matchedData(req);

    try {
        const foundItem = await User.findByPk(id);

        foundItem.set({ status })
        
        if (status == 0) {
            foundItem.set("last_online_time", moment.utc().format('YYYY-MM-DD HH:mm:ss'));
        }
        
        await foundItem.save()
        res.status(200).json(foundItem);

    } catch(err) {
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getProfilePostsByUserAndCategory = async (req, res) => {

    const { id } = req.user;
    const { user_id, category_id, sub_category_id } = req.query;

    const whereFilter = [ { author_id: user_id } ];
    
    if (category_id > 0) {  // if 0, all categories
        whereFilter.push({ category_id: category_id })
    }

    if (sub_category_id != 0) {
        whereFilter.push({ sub_category_id: sub_category_id });
    }

    if (id != user_id) {
        whereFilter.push({ is_premium: false });
    }

    whereFilter.push({ is_nft: false });

    try {
        const posts = await Post.findAll({
            where: whereFilter,
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:["name", "address", "lat", "lng"],
                },
                {
                    model:Comment,
                    as:"LastComment",
                    attributes:["content"],
                }
            ]
        });                
        
        res.status(200).json({ posts });

    } catch(err) {
        console.log(err);
        res.status(401).json({ err });
    }

}

exports.getUserNotifications = async (req, res) => {
    const { id } = req.user;
    const { offset, limit } = matchedData(req);

    try {
        let query = "SELECT true as is_comment, post_comments.content, post_comments.post_id, post_comments.createdAt, A.post_title, A.post_description, A.thumbnail_url, users.id as user_id, users.user_name, users.avatar_url FROM "
            + " post_comments RIGHT JOIN (SELECT posts.id as id, posts.post_title, posts.post_description, medias.thumbnail_url FROM `posts` LEFT JOIN users ON posts.owner_id = users.id LEFT JOIN medias ON"
            + " posts.media_id = medias.id WHERE users.id = " + id + ") AS A ON post_comments.post_id = A.id LEFT JOIN users ON post_comments.author_id = users.id WHERE post_comments.id IS NOT NULL"
            + " UNION "
            + "SELECT false as is_comment, '' as content, post_likes.post_id, post_likes.createdAt, A.post_title, A.post_description, A.thumbnail_url, users.id as user_id, users.user_name, users.avatar_url FROM post_likes "
            + "RIGHT JOIN (SELECT posts.id as id, posts.post_title, posts.post_description, medias.thumbnail_url FROM `posts` LEFT JOIN users ON posts.owner_id = users.id LEFT JOIN medias ON posts.media_id = medias.id" 
            + " WHERE users.id = " + id + ") AS A ON post_likes.post_id = A.id LEFT JOIN users ON post_likes.user_id = users.id WHERE post_likes.post_id IS NOT NULL"
            + " ORDER BY createdAt DESC limit " + offset + ", " + limit;
        const notifications = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.status(200).json(notifications);
    } catch (err) {
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.adminGetAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: {
                exclude: ['user_token', "password"]
            }
        });
        res.status(200).json(users);
    }catch(error){
        console.log(error.message)
        res.status(501).json({error: error.message});
    }


}