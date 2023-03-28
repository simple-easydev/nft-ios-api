
const { matchedData } = require('express-validator');
const { Post } = require('models/posts');
const { User } = require("models/users");
const { Sequelize } = require('sequelize');
const { sequelize } = require('models/db');
const { Media, MediaType } = require('models/media');
const Channels = require('models/channels');
const { randomNoRepeats } = require("helper");
const Location = require('models/location');
const { Comment } = require('models/comments');

const Op = Sequelize.Op;

exports.searchTopic = async (req, res) => {
    const { id } = req.user;
    const { query, limit, offset } = matchedData(req);

    try {
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            attributes: ["post_title"], 
            where: {
                status: "active",
                post_title: {
                    [Op.startsWith]:query
                }
         }});
        res.status(200).json(all);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.discoverTopic = async (req, res) => {
    const { id } = req.user;
    try {
        // channles 
        const user = await User.findByPk(id);
        const channels = await user.getChannels();
        const cIds = channels.map((ele)=>ele.id);
        const posts = await Post.findAll({
            attributes:["post_title"],
            where: {
                status:"active",
            },
            include: [
                {
                    attributes:["id", 'channel_name'],
                    model:Channels,
                    as:"Channel",
                    where: {
                        id: {
                            [Op.in]: cIds
                        }
                    }
                }
            ]
        });

        const chooser = randomNoRepeats(posts);

        const item1 = chooser();
        const item2 = chooser();
        const item3 = chooser();
        const item4 = chooser();
        const item5 = chooser();
        const item6 = chooser();

        res.status(200).json([item1, item2, item3, item4, item5, item6]);

    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getTrendsTopic = async (req, res) => {

    const like_counts = Sequelize.literal(`(
        SELECT COUNT(*)
        FROM post_likes
        WHERE
        post_likes.post_id = posts.id
        )`);
    try {
        const posts = await Post.findAndCountAll({
            offset: 0,
            limit:20,
            attributes:[
                "post_title", 
                [like_counts, 'like_counts']
            ],
            where: {
                status:"active",
            },
            order: [
                [like_counts, 'DESC'],
            ],
        });
        res.status(200).json(posts);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}

exports.getPostByTopic = async (req, res) => {

    const { id } = req.user;
    const { topic, offset, limit, category } = matchedData(req);

    const like_counts = Sequelize.literal(`(
        SELECT COUNT(*)
        FROM post_likes
        WHERE
        post_likes.post_id = posts.id
        )`);

    const whereObj = {

    };

    const orderArr = [];
    if(category == "general"){

    }
    if(category == "lastest"){
        orderArr.push(['id', 'DESC'])
    }
    if(category == "hot"){
        orderArr.push([like_counts, 'DESC'])
    }

    try{
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                [Op.or]: [
                    {
                        post_title: {
                            [Op.substring]: topic
                        }
                    },
                    {
                        post_description: {
                            [Op.substring]: topic
                        }
                    },
                    {
                        tags: {
                            [Op.substring]: topic
                        }
                    }
                ] 
            },
            // distinct: true,
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
                    attributes: [
                                "id", 'user_name', "profile_name", 'userID', 'avatar_url',
                                [Sequelize.literal(`(SELECT COUNT(*) FROM followers WHERE follower_id = ${id} AND user_id = Author.id)`), 'isFollowing']
                            ],
                    model:User,
                    as:"Author"
                },
                
                {
                    attributes:["id", 'channel_name'],
                    model:Channels,
                    as:"Channel"
                },
                {
                    model:Media,
                    include: {
                        model:MediaType,
                        // where: {
                        //     type_name:{
                        //         [Op.eq]:category
                        //     }
                        // }
                    },
                    // required:(category == "video" || category == "image" )
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
            ],
            order: orderArr,
        });

        res.status(200).json(all);

    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }

}

exports.getNftByTopic = async (req, res) => {

    const { id } = req.user;
    const { topic, offset, limit } = matchedData(req);

    const like_counts = Sequelize.literal(`(
        SELECT COUNT(*)
        FROM post_likes
        WHERE
        post_likes.post_id = posts.id
        )`);
        
    const orderArr = [];

    try{
        const all = await Post.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                status: "active",
                [Op.or]: [
                    {
                        post_title: {
                            [Op.substring]: topic
                        }
                    },
                    {
                        post_description: {
                            [Op.substring]: topic
                        }
                    },
                    {
                        tags: {
                            [Op.substring]: topic
                        }
                    }
                ], 
                is_nft:true
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
            order: orderArr,
        })
        res.status(200).json(all);
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}

exports.getUsersTopic = async (req, res) => {
    const { id } = req.user;
    const { topic, offset, limit } = matchedData(req);
    
    try {
        const all = await User.findAndCountAll({
            offset: parseInt(offset),
            limit:parseInt(limit),
            where: {
                user_name: {
                    [Op.substring]: topic
                }
            },
            attributes: ["id", "user_name", "avatar_url", "wallet_address", "location"]
        })
        res.status(200).json(all);
    }catch(err){
        console.log(err);
        res.status(401).json({ err });
    }
}