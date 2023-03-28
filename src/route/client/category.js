const controller = require('controllers/category');
const validator = require('controllers/category/validator');
const trimRequest = require('trim-request');
const expres = require('express');
const router = expres.Router();
const { authenticateToken } = require('middleware/auth');

router.post('/create', [trimRequest.all, validator.create ], controller.create);

router.get('/getAllCategories', [trimRequest.all], controller.getAllCategories);

router.put('/:id', [trimRequest.all, validator.update], controller.update);
router.delete('/:id', [trimRequest.all], controller.delete);

exports.default = router;