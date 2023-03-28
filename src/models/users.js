const db = require('./db');
const _ = require("lodash");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');

const { DataTypes } = require("sequelize");

const Channels = require('./channels');

const User = db.sequelize.define('users', {
    wallet_address: {
        type: DataTypes.TEXT
    },
    avatar_url: {
        type: DataTypes.TEXT,
    },
    background_url: {
        type: DataTypes.TEXT,
    },
    location: {
        type: DataTypes.TEXT
    },
    user_token: {
        type: DataTypes.TEXT
    },
    user_name: {
        type: DataTypes.CHAR
    },
    profile_name: {
        type: DataTypes.CHAR
    },
    twitter_name: {
        type: DataTypes.CHAR
    },
    instagram_name: {
        type: DataTypes.CHAR
    },
    linkedin_name: {
        type: DataTypes.CHAR
    },
    facebook_name: {
        type: DataTypes.CHAR
    },
    userID: {
        type: DataTypes.CHAR
    },
    gender: {
        type: DataTypes.ENUM,
        values: ["male", "female"]
    },
    birthday: {
        type: DataTypes.DATE
    },
    bio: {
        type: DataTypes.TEXT
    },
    password: {
        type: DataTypes.TEXT
    },
    age: {
        type: DataTypes.INTEGER
    },
    education: {
        type: DataTypes.TEXT
    },
    university_name: {
        type: DataTypes.CHAR
    },
    entrollment_time : {
        type: DataTypes.CHAR
    },
    email: {
        type: DataTypes.CHAR
    },
    phone_number: {
        type: DataTypes.CHAR
    },    
    email_verified: {
        type: DataTypes.BOOLEAN
    },
    phone_number_verified: {
        type: DataTypes.BOOLEAN
    },
    status: {
        type: DataTypes.TINYINT
    },
    last_online_time: {
        type: DataTypes.CHAR
    },
    color: {
        type: DataTypes.CHAR
    },
    intensity: {
        type: DataTypes.SMALLINT
    }
}, {freezeTableName:true, timestamps: false});

User.prototype.checkPassword = async function (password) {
    const isPasswordMatch = await auth.checkPassword(password, this.password);
    return isPasswordMatch;
}

User.prototype.isExistEmail = function (email) {
    return email == this.email;
}

User.prototype.isExistUsername = function (username) {
    return username == this.user_name
}

User.prototype.generateNewToken = async function () {
    const user_token = generateUserToken(this);
    this.user_token = user_token;
    await this.save();
    return this;
}

const UserChannels = db.sequelize.define('user_channels', {
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
    channel_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Channels,
            key: 'id'
        }
    },
}, {freezeTableName:true, timestamps: false });

User.belongsToMany(Channels, { through: UserChannels, foreignKey:"user_id" });
Channels.belongsToMany(User, { through: UserChannels, foreignKey:"channel_id" });

module.exports.UserChannels = UserChannels;

const FollowPeople = db.sequelize.define('followers', {
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
    follower_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        }
    },
}, {freezeTableName:true});

User.belongsToMany(User, { as : "Followers", through: FollowPeople, foreignKey:"user_id" });
User.belongsToMany(User, { as : "Users", through: FollowPeople, foreignKey:"follower_id" });

module.exports.User = User;

const Friends = db.sequelize.define('friends', {
    user_id: {
        type:DataTypes.BIGINT,
        references: {
            model:User, 
            key:"id"
        }
    },
    friend_id: {
        type:DataTypes.BIGINT,
        references: {
            model:User, 
            key:"id"
        }
    }
}, { freezeTableName:true });

User.belongsToMany(User, { as : "Friends", through: Friends, foreignKey:"user_id" });
User.belongsToMany(User, { as : "FriendUsers", through: Friends, foreignKey:"friend_id" });

module.exports.Friends = Friends;

const BlockList = db.sequelize.define('block_list', {
    user_id: {
        type:DataTypes.BIGINT,
        references: {
            model:User, 
            key:"id"
        }
    },
    blocked_user_id: {
        type:DataTypes.BIGINT,
        references: {
            model:User, 
            key:"id"
        }
    }
}, { freezeTableName:true });


User.belongsToMany(User, { as : "BlockedUsers", through: BlockList, foreignKey:"user_id" });
User.belongsToMany(User, { as : "Blockers", through: BlockList, foreignKey:"blocked_user_id" });

module.exports.BlockList = BlockList;

const NotificationSetting = db.sequelize.define('notification_setting', {
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        primaryKey: true
    },
    push_token: {
        type: DataTypes.TEXT
    },
    receive_message: {
        type: DataTypes.BOOLEAN
    },
    receive_like: {
        type: DataTypes.BOOLEAN
    },
    receive_follower: {
        type: DataTypes.BOOLEAN
    },
    receive_comment: {
        type: DataTypes.BOOLEAN
    },
    receive_chat: {
        type: DataTypes.BOOLEAN
    },
    receive_post: {
        type: DataTypes.BOOLEAN
    },
    recommend_people: {
        type: DataTypes.BOOLEAN
    }    
}, { freezeTableName:true, timestamps: false });

NotificationSetting.belongsTo(User, { as:"NotificationSetting", foreignKey: "user_id" });
User.hasOne(NotificationSetting, { foreignKey: "user_id" });

module.exports.NotificationSetting = NotificationSetting;