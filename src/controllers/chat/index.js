const { matchedData } = require('express-validator');

const { Post, TagPosts, PostCollects, PostLikes } = require('models/posts');
const { User, Friends } = require('models/users');
const Tags = require('models/tags');
const Location = require('models/location');
const { Comment } = require('models/comments');
const Channels = require('models/channels');
const { Media, MediaType } = require('models/media');

const { moveTempFileToUpload } = require('helper/file');

const { generateUriFromString } = require("helper");
const { Sequelize } = require('sequelize');
const { sendPushNotification } = require('helper/notification');
const Op = Sequelize.Op;


exports.getFriends = async (req, res) => {

    const { id } = req.user;
    try {
        const user  = await User.findByPk(id, {
            include: [
                {
                    model:User,
                    through: { model: Friends, attributes: [] },
                    as:"Friends",
                    attributes: ["id", "wallet_address", "avatar_url", "user_name", "profile_name", "userID", "gender"],
                }
            ]
        });
        const friends = user.getDataValue("Friends");
        res.status(200).json(friends);

    }catch(error){
        res.status(401).json({ error });
    }

}

exports.getLikesAndCollects = async (req, res) => {
    const { id } = req.user;
    try {
        const posts = await Post.findAll({
            where: {
                author_id: id
            },
            include: [
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:User,
                    required:true,
                    as: "Followers",
                    attributes:["id", "user_name", "profile_name", "userID", "avatar_url"],
                    through: {
                        model:PostLikes,
                        attributes:[["createdAt", "followedDate"]],
                    }
                },
                {
                    model:User,
                    required:true,
                    as: "Collectors",
                    attributes:["id", "user_name", "profile_name", "userID", "avatar_url"],
                    through: {
                        model:PostCollects,
                        attributes:[["createdAt", "collectedDate"]],
                    }
                },
            ]
        })

        res.status(200).json(posts);

    }catch(error){
        res.status(401).json({ error });
    }
}

exports.getCommenters = async (req, res) => {

    const { id } = req.user;

    try {
        const posts = await Post.findAll({
            where: {
                author_id: id
            },
            include: [
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:Comment,
                    as: "LastComment",
                    required:true,
                    include: {
                        attributes:["id", "wallet_address", "avatar_url", "user_name", "profile_name", "userID"],
                        model:User,
                        as:"Author"
                    },
                },
            ],
        })

        const lastCommenters = [];

        posts.forEach(element => {
            const item = element.LastComment;
            item.dataValues.post = {
                id:element.id,
                post_title:element.post_title,
                post_description:element.post_description,
                media:element.media,
                author_id:element.author_id,
            };
            lastCommenters.push(item);
        });

        res.status(200).json(lastCommenters);

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
            attributes:["id", 'user_name', 'userID', 'avatar_url', 
            [Sequelize.literal(`(
                SELECT COUNT(*)
                FROM friends WHERE user_id = ${id} AND friend_id = id
            )`), 'isFriend']],
            joinTableAttributes:[['createdAt', "followedDate"]]
        });
        res.status(200).json(followers);
    }catch(error){
        res.status(501).json({ error });
    }
}

exports.sendNotification = async (req, res) => {

    const {id} = req.user;

    const data = matchedData(req);

    const playerIds = [data.playerId];
    notiData = {
        title: "NFTSocial",
        subtitle: data.subtitle,
        message: data.message,
        action: "chat",
        fromId: id
    }

    try {
        const pushId = await sendPushNotification(playerIds, notiData);
        res.status(200).json({message:"success", pushId: pushId});
    } catch(error) {
        res.status(501).json({ error });
    }

}