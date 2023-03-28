/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();

const controller = require('controllers/vonage');

/*
 * Load routes statically and/or dynamically
 */


// router.get('/api/vonage', controller.voiceAnswer);

router.get('/api/vonage/voice/answer', controller.voiceAnswer);
router.get('/api/vonage/voice/event', controller.voiceEvent);
router.get('/api/vonage/voice/fallback', controller.voiceFallback);
router.get('/api/vonage/rtc/event', controller.rtcEvent);
router.get('/api/vonage/verify/status', controller.verifyStatus);


exports.routes = router;