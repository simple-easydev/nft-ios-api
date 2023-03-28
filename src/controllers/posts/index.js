const fs = require("fs-extra");
const { matchedData } = require('express-validator');
const { generateUriFromString } = require("helper");

const { Post, TagPosts, PostCollects, PostLikes } = require('models/posts');
const { User, NotificationSetting } = require('models/users');
const Tags = require('models/tags');
const Location = require('models/location');
const { Comment } = require('models/comments');
const { Media, MediaType } = require('models/media');

const { moveTempFileToUpload } = require('helper/file');
const { Sequelize } = require('sequelize');
const { sequelize } = require('models/db');
const { sendPushNotification } = require('helper/notification');
const { Categories, SubCategory } = require('models/categories');
const { getTotalRellaCoin, sendRellaCoinTo } = require('helper/smartcontract/rellaCoin');
const { Auction } = require("models/auction");
const LocationReview = require("models/location_review");
const { Event } = require("models/event");
const Op = Sequelize.Op;


exports.getAll = async (req, res) => {

    const { id } = req.user;
    const { offset, limit, query } = matchedData(req);

    try{
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active"
            },
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
                exclude: ["status"]
            },
            include: [ 
                {
                    attributes: [
                                "id", 'user_name', "profile_name", 'userID', 'avatar_url',
                                [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = ${id} AND user_id = Author.id)`), 'isFollowing']
                            ],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"SubCategory"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType,
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
                    // include: {
                    //     model:User
                    // }
                }
            ]
        });

        res.status(200).json(all);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getPostByCategory = async (req, res) => {

    const { id } = req.user;
    const { category_id, sub_category_id } = req.query;
    const { offset, limit, query } = matchedData(req);

    try{
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                category_id: {
                    [Op.eq]: parseInt(category_id)
                },
                sub_category_id: {
                    [Op.eq]: parseInt(sub_category_id)
                }
            },
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"SubCategory"
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

        res.status(200).json(all);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.popularPostByCategory = async (req, res) => {

    const { id } = req.user;
    const { category_id } = req.query;
    const { offset, limit } = matchedData(req);

    const like_counts = Sequelize.literal(`(
        SELECT COUNT(*)
        FROM post_likes
        WHERE
        post_likes.post_id = posts.id
        )`);

    try{
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                category_id: {
                    [Op.eq]: parseInt(category_id)
                }
            },
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
                    [like_counts, 'like_counts'],
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"SubCategory"
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
            ],
            order: [[like_counts, 'DESC']]
        });

        res.status(200).json(all);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getPostByTag = async (req, res) => {

    const { id } = req.user;
    const { tag_name } = req.params;
    const { offset, limit, query } = matchedData(req);

    try{
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                tags:  {
                    [Op.substring]: `#${tag_name}`
                }
            },
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts'],
                    [Sequelize.literal(`(
                        SELECT GROUP_CONCAT(users.user_name SEPARATOR ', ')
                        FROM post_likes left join users on users.id = post_likes.user_id
                        WHERE
                        post_likes.post_id = posts.id GROUP BY post_likes.post_id LIMIT 5
                        )`), 'like_user'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id AND author_id = ${id}
                        )`), 'isUserCommented'],
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author"
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

        res.status(200).json(all);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getPostsFromFollowers = async (req, res) => {
    const { id } = req.user;
    const { offset, limit, query } = matchedData(req);

    try{
        //get my followers
        const user = await User.findByPk(id);
        const followers = await user.getFollowers({ attributes: ["id"], joinTableAttributes:[]});
        const fIds = followers.map((ele)=>ele.id);

        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_nft: false,
                is_premium: false,
            },
            attributes: {
                include:[
                    [Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM post_likes
                    WHERE
                    post_likes.post_id = posts.id AND user_id = ${user.id}
                    )`), 'isLiked'],

                    [Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM post_collects
                    WHERE
                    post_collects.post_id = posts.id AND user_id = ${user.id}
                    )`), 'isCollected'],
                    [Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM post_likes
                    WHERE
                    post_likes.post_id = posts.id
                    )`), 'like_counts'],
                    [Sequelize.literal(`(
                        SELECT GROUP_CONCAT(users.user_name SEPARATOR ', ')
                        FROM post_likes left join users on users.id = post_likes.user_id
                        WHERE
                        post_likes.post_id = posts.id GROUP BY post_likes.post_id LIMIT 5
                        )`), 'like_user'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id AND author_id = ${user.id}
                        )`), 'isUserCommented'],

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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
                exclude: ["status"]
            },
            include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author",
                    where: {
                        id: { [Op.in]: [...fIds] }
                    },
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"SubCategory"
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
                    include: [
                        {
                            model: User,
                            as: "Author",
                            attributes: ["user_name"]
                        }
                    ]
                }
            ]
        });

        res.status(200).json(all);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getPostDetail = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const post = await Post.findByPk(id, {
            attributes: {
                include:[
                    [Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM post_likes
                    WHERE
                    post_likes.post_id = posts.id AND user_id = ${user.id}
                    )`), 'isLiked'],
    
                    [Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM post_collects
                    WHERE
                    post_collects.post_id = posts.id AND user_id = ${user.id}
                    )`), 'isCollected'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id AND author_id = ${user.id}
                        )`), 'isUserCommented'],

                    [Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM post_likes
                    WHERE
                    post_likes.post_id = posts.id
                    )`), 'like_counts'],
                    [Sequelize.literal(`(
                        SELECT GROUP_CONCAT(users.user_name SEPARATOR ', ')
                        FROM post_likes left join users on users.id = post_likes.user_id
                        WHERE
                        post_likes.post_id = posts.id GROUP BY post_likes.post_id LIMIT 5
                        )`), 'like_user'],    

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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
            },
            include: [ 
            {
                attributes: [
                    "id", 'user_name', "profile_name", 'userID', 'avatar_url',
                    [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = Author.id AND user_id = ${user.id})`), 'isFollowing']
                ],
                model:User,
                as:"Author"
            },
            {
                attributes:["id", 'name'],
                model:Categories,
                as:"Category"
            },
            {
                attributes:["id", 'name'],
                model:Categories,
                as:"SubCategory"
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
                }
            },
            {
                model:Location,
                as:"location",
                attributes:["name", "address", "lat", "lng"],
            },
            {
                model: Auction,
                as: "auction"
            },
            {
                model: LocationReview,
                as: "Review"
            },
            {
                model: Event,
                as: "Event"
            }
        ]});
        res.status(200).json(post)
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.create = async (req, res) => {
    const data = matchedData(req);
    const { id } = req.user;
    try {
        if(data.media_url){
            data.media_url = await moveTempFileToUpload(data.media_url)
        }
        if(data.thumbnail_url){
            data.thumbnail_url = await moveTempFileToUpload(data.thumbnail_url)
        }
        data.status = "active";

        const tagsArr = data.post_description.match(/#[a-zA-Z0-9_]+/g);

        data.post_description = data.post_description.replace(/#[a-zA-Z0-9_]+|@[a-zA-Z0-9_ ]+/g, "").replace(/\[/g, "").replace(/\]/g, "").trim();
        
        if (tagsArr) {
            data.tags = tagsArr.join(",");
        }

        const media = await Media.create({ media_url: data.media_url, media_type_id: data.media_type_id, thumbnail_url: data.thumbnail_url });
        const post = await Post.create({...data, author_id:id, media_id: media.id, owner_id: id });
        if(data.location){
            // data.location.geo = "POINT(" + data.location.lng + " " + data.location.lat + ")";       // mariadb geospatial gramma (local xampp)
            data.location.geo = "POINT(" + data.location.lat + " " + data.location.lng + ")";       // mysql geospatial gramma (online server)

            var location = await Location.findOne({
                where: { poi: data.location.poi }
            })

            if (!location) {
                location = await Location.create(data.location);
            }
            post.location_id = location.id;

            if (data.location_review) {
                const review = await LocationReview.create({...data.location_review, location_id: location.id, post_id: post.id });
                post.review_id = review.id;
            }

            await post.save();
        }

        const postUser = await User.findByPk(id);
        const postfollowers = await postUser.getUsers({ attributes: ["id"], joinTableAttributes:[]});
        const fIds = postfollowers.map((ele)=>ele.id);
        const users = await User.findAll({ 
            attributes: ['id', "user_name"],
            where: {
                id: { [Op.in]: [...fIds] }
            },
            include: {
                attributes: ['push_token'],
                model: NotificationSetting,
                where: {
                    receive_post: 1
                }
            }
        });
        
        const pushIds = users.map((ele) => ele.notification_setting.push_token);
        const filteredPushIds = pushIds.filter(ele => ele != "");

        const notificationData = {
            title: "NFTSocial",
            subtitle: postUser.user_name + " has new post",
            message: post.post_title,
            action: "post"
        }
        if (filteredPushIds.length > 0) {
            const pushId = await sendPushNotification(filteredPushIds, notificationData);
        }
        
        res.status(200).json(post);

    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.update = async (req, res) => {  // draft to active post with title
    const { id } = req.params;
    const data = matchedData(req);
    try {
        const post = await Post.findByPk(id);
        post.post_title = data.post_title;
        post.status = "active";
        await post.save();
        res.status(200).json(post);
    }catch(err){
        res.status(401).json({ err });
    }
}

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await Post.destroy({ where: { id }});
        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

/**
 * Like Post
 */
exports.likePost = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const post = await Post.findByPk(id, {
            attributes: {
                include: [
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_likes
                        WHERE
                        post_likes.post_id = posts.id
                        )`), 'like_counts'],
                ]
            },
            include: [ 
                {
                    attributes: [
                        "id", 'user_name', "profile_name", 'wallet_address'
                    ],
                    model:User,
                    as:"Author"
                }
            ]
        });
        await post.addFollowers(user.id);

        const likeUser = await User.findByPk(user.id);
        const oppositeUser = await User.findByPk(post.author_id, {
            include: {
                model: NotificationSetting
            }
        });
        if (oppositeUser.notification_setting.receive_like && oppositeUser.notification_setting.push_token) {
            const playerIds = [oppositeUser.notification_setting.push_token];
            data = {
                title: "NFTSocial",
                subtitle: likeUser.user_name + " likes your post",
                message: post.post_title,
                action: "like"
            }
            const pushId = await sendPushNotification(playerIds, data);
        }

        // rella coin calc
        const postValue = post.get();
        const author = post.Author.get();
        console.log("post user address", author.wallet_address);
        const postCoin = Math.floor((postValue.like_counts + 1) / 1000); // every 1000 likes earn 1 rella coin
        // const postCoin = Math.floor(1000 / 1000);
        if (postCoin > post.coin_amount) {
            post.coin_amount = postCoin;
            await post.save();

            // send 1 coin
            const amount = "1";
            const result = await sendRellaCoinTo(author.wallet_address, amount);
            console.log("coin transfer", result);

            if (oppositeUser.notification_setting.push_token) {
                const playerIds = [oppositeUser.notification_setting.push_token];
                data = {
                    title: "NFTSocial",
                    subtitle: "Congratulation!",
                    message: "You've got a Rella Coin!",
                    action: "Coin"
                }
                const pushId = await sendPushNotification(playerIds, data);
            }
        }        

        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.unLikePost = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const post = await Post.findByPk(id);
        await post.removeFollowers(user.id);
        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

/**
 * Like Comment
 */
 exports.likeComment = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const comment = await Comment.findByPk(id, {
            attributes: {
                include: [
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM comment_likes
                        WHERE
                        comment_likes.comment_id = post_comments.id
                        )`), 'like_counts'],
                ]
            },
            include: [ 
                {
                    attributes: [
                        "id", 'user_name', "profile_name", 'wallet_address'
                    ],
                    model:User,
                    as:"Author"
                }
            ]
        });

        await comment.addCommenter(user.id);

        const likeUser = await User.findByPk(user.id);
        const oppositeUser = await User.findByPk(comment.author_id, {
            include: {
                model: NotificationSetting
            }
        });
        if (oppositeUser.notification_setting.receive_like && oppositeUser.notification_setting.push_token) {
            const playerIds = [oppositeUser.notification_setting.push_token];
            data = {
                title: "NFTSocial",
                subtitle: likeUser.user_name + " likes your comment",
                message: comment.content,
                action: "like"
            }
            const pushId = await sendPushNotification(playerIds, data);
        }

        // rella coin calc
        // const postValue = post.get();
        // const author = post.Author.get();
        // console.log("post user address", author.wallet_address);
        // const postCoin = Math.floor((postValue.like_counts + 1) / 1000); // every 1000 likes earn 1 rella coin
        // // const postCoin = Math.floor(1000 / 1000);
        // if (postCoin > post.coin_amount) {
        //     post.coin_amount = postCoin;
        //     await post.save();

        //     // send 1 coin
        //     const amount = "1";
        //     const result = await sendRellaCoinTo(author.wallet_address, amount);
        //     console.log("coin transfer", result);

        //     if (oppositeUser.notification_setting.push_token) {
        //         const playerIds = [oppositeUser.notification_setting.push_token];
        //         data = {
        //             title: "NFTSocial",
        //             subtitle: "Congratulation!",
        //             message: "You've got a Rella Coin!",
        //             action: "Coin"
        //         }
        //         const pushId = await sendPushNotification(playerIds, data);
        //     }
        // }        

        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.unLikeComment = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const comment = await Comment.findByPk(id);
        await comment.removeCommenter(user.id);
        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

/**
 * Collect Post
 */
exports.collectPost = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const post = await Post.findByPk(id);
        await post.addCollectors(user.id);

        const collectUser = await User.findByPk(user.id);
        const oppositeUser = await User.findByPk(post.author_id, {
            include: {
                model: NotificationSetting
            }
        });
        if (oppositeUser.notification_setting.receive_like && oppositeUser.notification_setting.push_token) {
            const playerIds = [oppositeUser.notification_setting.push_token];
            data = {
                title: "NFTSocial",
                subtitle: collectUser.user_name + " collect your post",
                message: post.post_title,
                action: "collect"
            }
            const pushId = await sendPushNotification(playerIds, data);
        }

        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.unCollectPost = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const post = await Post.findByPk(id);
        await post.removeCollectors(user.id);
        res.status(200).json({ message:"success" });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.createComment = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const { content } = matchedData(req);

    try {
        const post = await Post.findByPk(id);
        const result = await Comment.create({ author_id: user.id, content, post_id: post.id });
        post.setLastComment(result.id);

        const commentUser = await User.findByPk(user.id);
        const oppositeUser = await User.findByPk(post.author_id, {
            include: {
                model: NotificationSetting
            }
        });
        if (oppositeUser.notification_setting.receive_comment && oppositeUser.notification_setting.push_token) {
            const playerIds = [oppositeUser.notification_setting.push_token];
            data = {
                title: "NFTSocial",
                subtitle: commentUser.user_name + " comment your post",
                message: post.post_title,
                action: "comment"
            }
            const pushId = await sendPushNotification(playerIds, data);
        }
        
        res.status(200).json(result);
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.updateComment = async (req, res) => {
    const { id } = req.params;
    const data = matchedData(req);
    const user = req.user;
    try {
        const comment = await Comment.findByPk(id);
        if(comment.author_id == user.id){
            comment.set(data);
            await comment.save();
            const replyies = await comment.getReplies();
            const replyCount = replyies.length;
            res.status(200).json({...comment.dataValues, replyCount});
        }else{
            res.status(401).json({ message:"invalid author" });
        }1
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.deleteComment = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const comment = await Comment.findByPk(id);
        if(comment.author_id == user.id){
            await comment.destroy();
            res.status(200).json({ message:"success" });
        }else{
            res.status(401).json({ message:"invalid author" });
        }
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getComments = async (req, res) => {
    const { post_id } = req.params;
    const user = req.user;
    const { offset, limit, query } = matchedData(req);

    try{
        const count = await Comment.count({
            where : {
                post_id,
                parent_comment_id:null
            },
        });
        const comments = await Comment.findAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where : {
                post_id,
                parent_comment_id:null
            },
            distinct:true,
            subQuery:false,
            attributes: { 
                include: [
                    [Sequelize.fn("COUNT", Sequelize.col("Replies.id")), "replyCount"],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM comment_likes
                        WHERE
                        comment_likes.comment_id = post_comments.id
                        )`), 'like_counts'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM comment_likes
                        WHERE
                        comment_likes.comment_id = post_comments.id AND user_id = ${user.id}
                        )`), 'isLiked'],
                ] 
            },
            include: [ 
                {
                    attributes: [],
                    model:Comment,
                    as:"Replies",
                },
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url'],
                    model:User,
                    as:"Author"
                }
            ],
            group: ['id'],
        })
        res.status(200).json({count, rows:comments});
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getReplies = async (req, res) => {
    const { comment_id } = req.params;
    const user = req.user;
    const { offset, limit } = matchedData(req);
    try{
        const comments = await Comment.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                parent_comment_id: comment_id
            },
            attributes: { 
                include: [
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM comment_likes
                        WHERE
                        comment_likes.comment_id = post_comments.id
                        )`), 'like_counts'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM comment_likes
                        WHERE
                        comment_likes.comment_id = post_comments.id AND user_id = ${user.id}
                        )`), 'isLiked'],
                ] 
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url'],
                    model:User,
                    as:"Author"
                }
            ]
        })
        res.status(200).json(comments);
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.replyComment = async (req, res) => {
    const { id } = req.params;
    const { content } = matchedData(req);
    const author = req.user;
    console.log("comment_id --->", id);
    try {
        const comment = await Comment.findByPk(id);
        const reply = await Comment.create({
            author_id: author.id,
            post_id: comment.post_id,
            content
        });
        await comment.addReplies(reply);
        res.status(200).json(reply);
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getTagsTagUsersMediaTypes = async (req, res) => {

    const author = req.user;

    try {
        const user = await User.findByPk(author.id);
        const followers = await user.getFollowers({ attributes: ["id", "user_name"], joinTableAttributes:[]});
        const tags = await Tags.findAll({ attributes: ["id", "tag_name", "tag_uri"]});
        const media_types = await MediaType.findAll({ attributes: ["id", "type_name"]});
        res.status(200).json({
            tag_users: followers,
            tags,
            media_types
        });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getNearByPosts = async (req, res) => {
    
    const { lat, lng, radius, category_id, sub_category_id } = matchedData(req);

    try {

        // const location = sequelize.literal(`ST_GeomFromText('POINT(${lng} ${lat})', 4326)`);     // mariadb geospatial gramma
        
        const location = sequelize.literal(`ST_GeomFromText('POINT(${lat} ${lng})', 4326)`);        // mysql geospatial gramma
        const geo = sequelize.literal(`ST_GeomFromText(location.geo, 4326)`);
        const distance = sequelize.fn('ST_Distance_Sphere', geo, location);
        const nearByFilter = [ sequelize.where(distance, "<", radius) ];
                
        const all = await Post.findAll({
            // offset: parseInt(offset),
            // limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                review_id: {
                    [Op.not]: null, 
                },
            },
            attributes: ["id", [sequelize.fn('AVG', sequelize.col('Review.review')), 'avg_review']],
            include: [ 
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model:Location,
                    as:"location",
                    attributes:{
                        include: [
                            [distance, 'distance']
                        ] 
                    },
                    where: nearByFilter,
                },
                {
                    model: LocationReview,
                    as: "Review",
                    attributes: [],
                    where: {
                        category_id: category_id,
                        sub_category_id: sub_category_id
                    }
                }
            ],
            group: ['location.poi'],
            order: distance
        });
        res.status(200).json(all);

    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getNearByPostsWithPOI = async (req, res) => {

    const { offset, limit, poi, category_id, sub_category_id, lat, lng } = matchedData(req);

    const whereFilter = [];
    if (category_id) {
        whereFilter.push({category_id});
    }
    if (sub_category_id) {
        whereFilter.push({sub_category_id});
    }

    // const location = sequelize.literal(`ST_GeomFromText('POINT(${lng} ${lat})', 4326)`);     // mariadb geospatial gramma
    const location = sequelize.literal(`ST_GeomFromText('POINT(${lat} ${lng})', 4326)`);        // mysql geospatial gramma
    const geo = sequelize.literal(`ST_GeomFromText(location.geo, 4326)`);
    const distance = sequelize.fn('ST_Distance_Sphere', geo, location);

    try {
                
        const all = await Post.findAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                review_id: {
                    [Op.not]: null, 
                },
            },
            include: [
                {
                    attributes: [
                        "id", 'user_name', "profile_name", 'userID', 'avatar_url'
                    ],
                    model:User,
                    as:"Author"
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
                    attributes:{
                        include: [
                            [distance, 'distance']
                        ] 
                    },
                    where: {
                        poi: poi
                    }
                },
                {
                    model: LocationReview,
                    as: "Review",
                    attributes: ['review'],
                    where: whereFilter
                }
            ],
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json(all);

    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getNFTMetadata = async (req, res) => {
    const { token } = req.params;
    const host = req.protocol + '://' + req.get('host');
    try {
        const post = await Post.findOne({
            where: {
                nft_token: token
            },
            include: [
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
            ]
        })
        const metadata = {
            name: post.post_title,
            description: post.post_description,
            image: host + post.media.media_url
        }
        res.status(200).json(metadata);
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.updateNFTToken = async (req, res) => {
    const { post_id, nft_token, collection_symbol, collection_address } = matchedData(req);

    const host = req.protocol + '://' + req.get('host');

    try {
        const post = await Post.findByPk(post_id, {
            include: [
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
            ]
        })
        post.nft_token = nft_token;
        post.collection_address = collection_address;
        await post.save();

        const metadata = {
            name: post.post_title,
            description: post.post_description,
            image: host + post.media.media_url
        };

        var savePath = './public/metadata/' + collection_symbol + "/" + nft_token + ".json";

        fs.outputFile(savePath, JSON.stringify(metadata), function(err) {
            if (err) {
              res.status(404).send(err);
              return;
            }
        
            res.status(200).json({ "message": "success" });
          });
    }catch(err){
        console.log("err", err);
        res.status(401).json({ err });
    }
}

exports.updateNFTSaleState = async (req, res) => {
    const { post_id, on_sale } = matchedData(req);
    try {
        const post = await Post.findByPk(post_id);
        post.on_sale = on_sale;
        await post.save();
        res.status(200).json(post);
    }catch(err){
        res.status(401).json({ err });
    }
}

exports.updateNFTOwner = async (req, res) => {
    const { id } = req.user;
    const { post_id } = matchedData(req);
    try {
        const post = await Post.findOne({
            where: {id: post_id, on_sale: true}
        });
        if (post) {
            post.owner_id = id;
            post.on_sale = false;
            await post.save();
            res.status(200).json(post);
        } else {
            res.status(403).json({error: "nft is not on sale"});
        }
    }catch(err){
        res.status(401).json({ err });
    }
}

exports.createNFTPost = async (req, res) => {
    const data = matchedData(req);
    const { id } = req.user;
    try {
        if(data.media_url){
            data.media_url = await moveTempFileToUpload(data.media_url)
        }
        if(data.thumbnail_url){
            data.thumbnail_url = await moveTempFileToUpload(data.thumbnail_url)
        }
        data.status = "active";
        data.is_nft = true;

        const media = await Media.create({ media_url: data.media_url, media_type_id: data.media_type_id, thumbnail_url: data.thumbnail_url });
        const post = await Post.create({...data, author_id:id, media_id: media.id, owner_id: id });
        
        // const postUser = await User.findByPk(id);
        // const postfollowers = await postUser.getUsers({ attributes: ["id"], joinTableAttributes:[]});
        // const fIds = postfollowers.map((ele)=>ele.id);
        // const users = await User.findAll({ 
        //     attributes: ['id', "user_name"],
        //     where: {
        //         id: { [Op.in]: [...fIds] }
        //     },
        //     include: {
        //         attributes: ['push_token'],
        //         model: NotificationSetting,
        //         where: {
        //             receive_post: 1
        //         }
        //     }
        // });
        
        // const pushIds = users.map((ele) => ele.notification_setting.push_token);
        // const filteredPushIds = pushIds.filter(ele => ele != "");

        // const notificationData = {
        //     title: "NFTSocial",
        //     subtitle: postUser.user_name + " has new post",
        //     message: post.post_title,
        //     action: "post"
        // }
        // if (filteredPushIds.length > 0) {
        //     const pushId = await sendPushNotification(filteredPushIds, notificationData);
        // }        

        res.status(200).json(post);

    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getNFTPostsByCategory = async (req, res) => {

    // const author = req.user;
    const { category_id, offset, limit } = matchedData(req);

    try {
        const nfts = await Post.findAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            attributes:[ "id", "price", "post_title", "post_description", 'on_sale'],
            include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author",
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category",
                },                
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model: Auction,
                    as: "auction"
                }
            ],
            where: {
                is_nft: 1,
                nft_token: {
                    [Op.not]: null, 
                },
                category_id: category_id
            }
        })
        res.status(200).json({ nfts });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getNFTPostsByUser = async (req, res) => {

    // const author = req.user;
    const { user_id, type, offset, limit } = matchedData(req);

    const whereFilter = [ { is_nft: 1} ];

    whereFilter.push({ 
        nft_token: {
            [Op.not]: null, 
        }
    });

    if (type == 1) { // created nfts
        whereFilter.push({ author_id: user_id })
    } else if (type == 2) { // on sale nfts
        whereFilter.push({ author_id: user_id })
        whereFilter.push({ on_sale: true })
    } else if (type == 3) { // owned nfts
        whereFilter.push({ owner_id: user_id })
    }
    
    try {
        const nfts = await Post.findAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            attributes:[ "id", "nft_token", "collection_address", "price", "post_title", "post_description", "author_id", "owner_id", "on_sale"],
            include: [ 
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author",
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category",
                },                
                {
                    model:Media,
                    include: {
                        model:MediaType
                    }
                },
                {
                    model: Auction,
                    as: "auction"
                }
            ],
            where: whereFilter
        })
        res.status(200).json({ nfts });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getRellaCoinBalance = async (req, res) => {

    const { holder } = req.params;
    try {
        let balance = await getTotalRellaCoin(holder);
        res.status(200).json({ balance });
    } catch (err) {
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.testSend = async (req, res) => {

    const { toAddress, amount } = matchedData(req);
    try {
        const result = await sendRellaCoinTo(toAddress, amount);
        res.status(200).json({ result });
    } catch (err) {
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getEventPosts = async (req, res) => {

    const { id } = req.user;
    const { event_id } = req.params;

    try {
        const posts = await Post.findAll({
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"SubCategory"
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
                },
                {
                    model: Event,
                    as: "Event",
                    where: {
                        id: event_id
                    }
                }
            ]
        })

        res.status(200).json(posts);
    } catch (err) {
        console.log(err)
        res.status(401).json({ err })
    }

}

// Drafts post
// exports.createDraft = async (req, res) => {
//     const data = matchedData(req);
//     const { id } = req.user;
//     try {
//         if(data.media_url){
//             data.media_url = await moveTempFileToUpload(data.media_url)
//         }
//         if(data.thumbnail_url){
//             data.thumbnail_url = await moveTempFileToUpload(data.thumbnail_url)
//         }
//         data.status = "draft";

//         const tagsArr = data.post_description.match(/#[a-zA-Z0-9_]+/g);

//         data.post_description = data.post_description.replace(/#[a-zA-Z0-9_]+|@[a-zA-Z0-9_ ]+/g, "").replace(/\[/g, "").replace(/\]/g, "").trim();
        
//         if (tagsArr) {
//             data.tags = tagsArr.join(",");
//         }

//         const media = await Media.create({ media_url: data.media_url, media_type_id: data.media_type_id, thumbnail_url: data.thumbnail_url });
//         const post = await Post.create({...data, author_id:id, media_id: media.id, owner_id: id });
//         if(data.location){
//             // data.location.geo = "POINT(" + data.location.lng + " " + data.location.lat + ")";       // mariadb geospatial gramma (local xampp)
//             data.location.geo = "POINT(" + data.location.lat + " " + data.location.lng + ")";       // mysql geospatial gramma (online server)
//             data.location.category = data.location.category.replace("MKPOICategory", "");
//             const location = await Location.create(data.location);
//             await post.setLocation(location.id);
//         }

//         res.status(200).json(post);

//     }catch(err){
//         console.log(err);
//         res.status(401).json({ err });
//     }
// }

// exports.updateDraft = async (req, res) => {
//     const { id } = req.params;
//     const data = matchedData(req);
//     try {
//         const post = await Post.findByPk(id);

//         const tagsArr = data.post_description.match(/#[a-zA-Z0-9_]+/g);

//         data.post_description = data.post_description.replace(/#[a-zA-Z0-9_]+|@[a-zA-Z0-9_ ]+/g, "").replace(/\[/g, "").replace(/\]/g, "").trim();
        
//         if (tagsArr) {
//             data.tags = tagsArr.join(",");
//         }

//         post.post_description = data.post_description;
//         post.tags = data.tags;

//         const media = await Media.findByPk(post.media_id);
//         if(data.media_url){
//             media.media_url = await moveTempFileToUpload(data.media_url)
//         }
//         if(data.thumbnail_url){
//             media.thumbnail_url = await moveTempFileToUpload(data.thumbnail_url)
//         }
//         if (data.media_type_id) {
//             media.media_type_id = data.media_type_id;
//         }
//         await media.save();

//         if (data.category_id) {
//             post.category_id = data.category_id;
//         }
//         if (data.sub_category_id) {
//             post.sub_category_id = data.sub_category_id;
//         }
//         if (data.tag_users) {
//             post.tag_users = data.tag_users;
//         }
//         if (data.tag_event) {
//             post.tag_event = data.tag_event;
//         }

//         await post.save();

//         if(data.location){
//             // data.location.geo = "POINT(" + data.location.lng + " " + data.location.lat + ")";       // mariadb geospatial gramma (local xampp)
//             data.location.geo = "POINT(" + data.location.lat + " " + data.location.lng + ")";       // mysql geospatial gramma (online server)
//             data.location.category = data.location.category.replace("MKPOICategory", "");
//             var location = await Location.create(data.location);
//             await post.setLocation(location.id);
//         }
//         res.status(200).json(post);
//     }catch(err){
//         res.status(401).json({ err });
//     }
// }

exports.createCollection = async (req, res) => {

    const data = matchedData(req);
    const host = req.protocol + '://' + req.get('host');

    try {
        const image_url = await moveTempFileToUpload(data.media_url);
        
        const metadata = {
            name: data.name,
            description: data.description,
            image: host + image_url
        };

        var savePath = './public/metadata/' + data.symbol + ".json"

        fs.outputFile(savePath, JSON.stringify(metadata), function(err) {
            if (err) {
              res.status(404).send(err);
              return;
            }
        
            res.status(200).json({ "message": "success" });
          });
        
    } catch (err) {
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.setPrice = async (req, res) => {

    const { post_id, price, price_address } = matchedData(req);

    try {
        const nft = await Post.findByPk(post_id);
        nft.price = price;
        nft.on_sale = true;
        nft.price_address = price_address;
        nft.save();
        res.status(200).json({ "message": "success" });
    } catch(err) {
        res.status(401).json({err})
    }

}

exports.searchExplorePosts = async (req, res) => {

    console.log("called search explore");
    const { id } = req.user;
    const { category, offset, limit, text } = matchedData(req);

    try {
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                category_id: category,
                [Op.or]: [
                    {
                        post_title:  {
                            [Op.substring]: text
                        }
                    },
                    {
                        post_description:  {
                            [Op.substring]: text
                        }
                    },
                    {
                        tags:  {
                            [Op.substring]: text
                        }
                    }
                ]
            },
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts'],
                    [Sequelize.literal(`(
                        SELECT GROUP_CONCAT(users.user_name SEPARATOR ', ')
                        FROM post_likes left join users on users.id = post_likes.user_id
                        WHERE
                        post_likes.post_id = posts.id GROUP BY post_likes.post_id LIMIT 5
                        )`), 'like_user'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id AND author_id = ${id}
                        )`), 'isUserCommented'],
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author"
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
        res.status(200).json( all );
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.searchFollowingPosts = async (req, res) => {

    const { id } = req.user;
    const { offset, limit, text } = matchedData(req);

    const user = await User.findByPk(id);
    const followers = await user.getFollowers({ attributes: ["id"], joinTableAttributes:[]});
    const fIds = followers.map((ele)=>ele.id);

    try {
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                is_premium: false,
                is_nft: false,
                [Op.or]: [
                    {
                        post_title:  {
                            [Op.substring]: text
                        }
                    },
                    {
                        post_description:  {
                            [Op.substring]: text
                        }
                    },
                    {
                        tags:  {
                            [Op.substring]: text
                        }
                    }
                ]
            },
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts'],
                    [Sequelize.literal(`(
                        SELECT GROUP_CONCAT(users.user_name SEPARATOR ', ')
                        FROM post_likes left join users on users.id = post_likes.user_id
                        WHERE
                        post_likes.post_id = posts.id GROUP BY post_likes.post_id LIMIT 5
                        )`), 'like_user'],
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM post_comments
                        WHERE
                        post_comments.post_id = posts.id AND author_id = ${id}
                        )`), 'isUserCommented'],
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author",
                    where: {
                        id: { [Op.in]: [...fIds] }
                    }
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
        res.status(200).json({ all });
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

// premium
exports.updatePremium = async (req, res) => {
    const { id } = req.user;
    const { post_id, is_premium } = matchedData(req);

    try {

        const post = await Post.findByPk(post_id);
        if (post) {
            post.is_premium = is_premium;
            await post.save()
            res.status(200).json(post);
        } else {
            res.status(401).json({ message: "There is no post" });
        }


    } catch(err) {
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getPremiumPosts = async (req, res) => {
    const { id } = req.user;
    const { user_id } = req.params
    try {
        const posts = await Post.findAll({
            where: {author_id: user_id, is_premium: true},
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
                    post_comments.post_id = posts.id AND ISNULL(parent_comment_id)
                    )`), 'comments_counts']
                ],
                exclude: ["status"]
            },
            include: [
                {
                    attributes:["id", 'user_name', "profile_name", 'userID', 'avatar_url', 'status'],
                    model:User,
                    as:"Author"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"Category"
                },
                {
                    attributes:["id", 'name'],
                    model:Categories,
                    as:"SubCategory"
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
        })
        res.status(200).json(posts);
    } catch (err) {
        console.log(err);
        res.status(401).json({ err });
    }
}