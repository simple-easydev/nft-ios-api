const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');
const { User } = require("./users");
const Channels = require("./channels");
const Location = require("./location");
const Tags = require("./tags");
const { Media } = require("./media");
const { Comment } = require("./comments");

const { DataTypes } = require("sequelize");
const { Categories } = require('./categories');
const LocationReview = require('./location_review');
const { Event } = require('./event');

const Post = db.sequelize.define('posts', {
    is_nft: {
        type: DataTypes.BOOLEAN
    },
    collection_address: {
        type: DataTypes.CHAR
    },
    nft_token: {
        type: DataTypes.TEXT
    },
    post_title: {
        type: DataTypes.TEXT
    },
    post_description: {
        type: DataTypes.TEXT
    },
    category_id: {
        type: DataTypes.BIGINT,
        references:{
            model: Categories,
            key:'id'
        }
    },
    sub_category_id: {
        type: DataTypes.BIGINT,
        references:{
            model: Categories,
            key:'id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(50, 20)
    },
    status: {
        type: DataTypes.ENUM,
        values: ['draft','pending','active']
    },
    media_id: {
        type: DataTypes.BIGINT,
        references: {
            model:Media,
            key:'id'
        }
    },
    author_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
    location_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Location,
            key: 'id'
        }
    },
    last_comment_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Comment,
            key: 'id'
        }
    },
    tags: {
        type: DataTypes.CHAR
    },
    tag_users: {
        type: DataTypes.CHAR
    },
    
    tag_event: {
        type: DataTypes.CHAR
    },

    nft_properties: {
        type: DataTypes.TEXT
    },
    coin_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    on_sale: {
        type: DataTypes.BOOLEAN
    },
    owner_id: {
        type: DataTypes.BIGINT
    },
    message_users: {
        type: DataTypes.CHAR
    },
    price_address: {
        type: DataTypes.CHAR
    },
    review_id: {
        type: DataTypes.INTEGER
    },
    event_id: {
        type: DataTypes.INTEGER
    },
    is_premium: {
        type: DataTypes.BOOLEAN
    }
}, { freezeTableName:true });

Post.belongsTo(User, { as:"Author", foreignKey: "author_id" });
User.hasMany(Post, { foreignKey: "author_id" });

Post.belongsTo(Comment, { as:"LastComment", foreignKey: "last_comment_id" });
Comment.hasOne(Post, { foreignKey: "last_comment_id" });

Post.belongsTo(Categories, {as:"Category", foreignKey: "category_id" });
Categories.hasMany(Post, { foreignKey: "category_id" });

Post.belongsTo(Categories, {as:"SubCategory", foreignKey: "sub_category_id" });
Categories.hasMany(Post, { foreignKey: "sub_category_id" });

Post.belongsTo(Media, { foreignKey: "media_id" });
Media.hasMany(Post, { foreignKey: 'media_id' });

Post.belongsTo(Location, {foreignKey:"location_id"});
Location.hasOne(Post, {foreignKey:"location_id"});

/**
 * Post-Comment relationship
 */
 Post.hasMany(Comment, { as:"Comments",  foreignKey:"post_id" });
 Comment.belongsTo(Post, { foreignKey:"post_id" });

 // post - review
 Post.belongsTo(LocationReview, {as: "Review", foreignKey: "review_id"});
 LocationReview.hasOne(Post, {foreignKey: "review_id"});

 // post - event
 Post.belongsTo(Event, {as: "Event", foreignKey: "event_id"});
 Event.hasOne(Post, {foreignKey: "event_id"});

module.exports.Post = Post;


/**
 * Tag-Post relationship
 */

// const TagPosts = db.sequelize.define('tag_posts', {
//     tag_id: {
//         type: DataTypes.BIGINT,
//         references: {
//             model: Tags,
//             key: 'id'
//         }
//     },
//     tag_user_id: {
//         type: DataTypes.BIGINT,
//         references: {
//             model: User,
//             key: 'id'
//         }
//     },
//     post_id: {
//         type: DataTypes.BIGINT,
//         references: {
//             model: Post,
//             key: 'id'
//         }
//     },
// }, {freezeTableName:true, timestamps: false});


// Post.belongsToMany(Tags, { as: "Tags", through: TagPosts, foreignKey:"post_id" });
// Tags.belongsToMany(Post, { through: TagPosts, foreignKey:"tag_id" });

// User.belongsToMany(Post, { through: TagPosts, foreignKey:"tag_user_id" });
// Post.belongsToMany(User, { as:"TagUsers", through: TagPosts, foreignKey:"post_id" })

// module.exports.TagPosts = TagPosts;

// User.hasMany(TagPosts, { foreignKey:"tag_user_id" });
// TagPosts.belongsTo(User, { as:"TagUsers", foreignKey:"tag_user_id" });

// Tags.hasMany(TagPosts, { foreignKey:"tag_id" });
// TagPosts.belongsTo(Tags, { as:"Tags", foreignKey:"tag_id" });


/**
 * Like-Post relationship
 */
 const PostLikes = db.sequelize.define('post_likes', {
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
    post_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Post,
            key: 'id'
        }
    },
}, {freezeTableName:true});

Post.belongsToMany(User, { as: "Followers", through: PostLikes, foreignKey:"post_id" });
User.belongsToMany(Post, { through: PostLikes, foreignKey:"user_id" });

module.exports.PostLikes = PostLikes;

/**
 * Collect-Post relationship
 */
 const PostCollects = db.sequelize.define('post_collects', {
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
    post_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Post,
            key: 'id'
        }
    },
}, {freezeTableName:true});

Post.belongsToMany(User, { as: "Collectors", through: PostCollects, foreignKey:"post_id" });
User.belongsToMany(Post, { through: PostCollects, foreignKey:"user_id" });

module.exports.PostCollects = PostCollects;

