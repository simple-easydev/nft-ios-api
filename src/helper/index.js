/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const utils = require('middleware/utils');

/**
 * Generates a user token
 * @param {Object} user - user object
 */
exports.generateUserToken = (user) => {

    const JWT_EXPIRATION_IN_MINUTES = process.env.JWT_EXPIRATION_IN_MINUTES;
    // Gets expiration time
    const expiration = Math.floor(Date.now() / 1000) + 60 * parseFloat(JWT_EXPIRATION_IN_MINUTES);

    // returns signed and encrypted token
    return jwt.sign(
        {
            id: user.id,
            location_tag_id:user.location_tag_id || 0,
            exp: expiration
        },
        process.env.JWT_SECRET
    );
};


/**
 * Gets user id from token
 * @param {string} token - Encrypted and encoded token
 */
exports.getUserAccountFromToken = async (token) => {
    return new Promise((resolve, reject) => {
        // Decrypts, verifies and decode token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(utils.buildErrObject(409, 'BAD_TOKEN'));
            }
            resolve(decoded.data._id);
        });
    });
};


exports.generateUriFromString = (str) => {
	if(str){
		return str.toLowerCase().match(/[a-zA-Z0-9]+/g)?.join('-');
	}
	return str;
};

exports.sortModelHomesArray = (sources, sortArr) => {

    function arrayUnique(array) {
        const a = array.concat();
        for(let i=0; i<a.length; ++i) {
            for(let j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    }
    
    const newArr = [];
    for(let i = 0; i < sortArr.length; i++){
        const p_id = sortArr[i];
        for(let j = 0; j < sources.length; j++){
            if(sources[j].id == p_id){
                newArr.push(sources[j]);
            }
        }
    }
    return arrayUnique(newArr.concat(sources));
};

exports.getRandomInt = (max) => {
    return Math.floor(Math.random() * max) + 1;
}

exports.randomNoRepeats = (array) => {
    var copy = array.slice(0);
    return function() {
      if (copy.length < 1) { copy = array.slice(0); }
      var index = Math.floor(Math.random() * copy.length);
      var item = copy[index];
      copy.splice(index, 1);
      return item;
    };
  }