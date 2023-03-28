const controller = require('controllers/upload');
const express = require('express');
const { authenticateToken } = require('middleware/auth');

const router = express.Router();
const trimRequest = require('trim-request');

router.post('/file', [trimRequest.all, authenticateToken], controller.uploadFile);
router.post('/uploadFileBase64', [trimRequest.all, authenticateToken], controller.uploadFileBase64);

exports.default = router;
