
const bcrypt = require("bcrypt-nodejs");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const algorithm = 'aes-256-ecb';
const secret = process.env.JWT_SECRET;

const utils = require('./utils');

function comparePassword(passwordAttempt, password, done) {
    bcrypt.compare(passwordAttempt, password, (err, isMatch) =>{
        err ? done(err) : done(null, isMatch)
    });
}

const hash = async (password, salt) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, salt, null, (error, newHash) => {
            if (error) {
                reject(error);
            }
            resolve(newHash);
        });
    });
};

exports.getHash = async (userPassword) => {
    const SALT_FACTOR = 5;
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
            if (err) {
                reject(err);
            }
            resolve(hash(userPassword, salt));
        });
    });
};

/**
 * Checks is password matches
 * @param {string} password - password
 * @param {string} userPassword - user password
 * @returns {boolean}
 */

exports.checkPassword = (password, userPassword) => {
    return new Promise((resolve, reject) => {
        comparePassword(password, userPassword, (err, isMatch) => {
            if (err) {
                reject(err.message);
            }
            if (!isMatch) {
                resolve(false);
            }
            resolve(true);
        });
    });
};


/**
 * Checks is token matches
 * @param {Request} password - password
 * @param {Response} userPassword - user password
 * @returns {boolean}
 */


exports.authenticateToken = (req, res, next) => {

    // Gather the jwt access token from the request header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token === 'null') {
        res.status(401).json({error: 'EMPTY TOKEN'});
    }else{
        console.log("token ===>", token);
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            console.log(err);
            if (err) return res.status(401).json({error: 'invalid token'});
            // console.log( "user ===>", user);
            req.user = user;
            next(); // pass the execution off to whatever request the client intended
        });
    }
};