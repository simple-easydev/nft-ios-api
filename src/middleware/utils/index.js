const { validationResult } = require('express-validator');




/**
 * Removes extension from file
 * @param {string} file - filename
 */
exports.removeExtensionFromFile = (file) => {
    return file.split('.').slice(0, -1).join('.').toString();
};

/**
 * Builds error for validation files
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} next - next object
 */
 exports.validationResult = (req, res, next) => {
    try {
        validationResult(req).throw();
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase();
        }
        return next();
    } catch (err) {
        return res.status(422).json({error:err.errors});
    }
};