const db = require('./db');
const _ = require("lodash");
const { DataTypes } = require("sequelize");
const { User } = require("./users");

const Comment = db.sequelize.define('post_comments', {
    content: {
        type: DataTypes.TEXT
    },
    author_id: {
        type: DataTypes.BIGINT
    },
    post_id: {
        type: DataTypes.BIGINT
    },
    parent_comment_id: {
        type: DataTypes.BIGINT,
    }
}, { freezeTableName:true });


Comment.hasMany(Comment, { as:"Replies",  foreignKey:"parent_comment_id" })
Comment.belongsTo(Comment, { foreignKey:"parent_comment_id" })

User.hasMany(Comment, { foreignKey:"author_id" })
Comment.belongsTo(User, { as:"Author",  foreignKey:"author_id" })

// User.hasMany(Comment, { foreignKey:"callee_id" })
// Comment.belongsTo(User, { as:"callee",  foreignKey:"callee_id" })

module.exports.Comment = Comment;

/**
 * Like-Comment relationship
 */
 const CommentLikes = db.sequelize.define('comment_likes', {
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
    comment_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Comment,
            key: 'id'
        }
    },
}, {freezeTableName:true});

Comment.belongsToMany(User, { as: "Commenter", through: CommentLikes, foreignKey:"comment_id" });
User.belongsToMany(Comment, { through: CommentLikes, foreignKey:"user_id" });

module.exports.CommentLikes = CommentLikes;