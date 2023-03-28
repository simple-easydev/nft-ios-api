const { matchedData } = require('express-validator');
const { onInboundCall } = require('helper/vonage/voice');

exports.voiceAnswer = async (req, res) => {
    const ncco = [
        {
            "action":"talk",
            "text":"Pleas wait while we connect you"
        },
        {
            "action":"connect",
            "from":"12013816684",
            "endpoint":[
                {
                    "type":"phone",
                    "number":req.query.to
                }
            ]
        }
    ]
    res.status(200).json(ncco);
}

exports.voiceEvent = async (req, res) => {
    try {
        console.log("---voice answer---");
        res.status(200).json({ success:"true" });
    }catch(error){
        res.status(401).json({ error });
    }
}

exports.voiceFallback = async (req, res) => {
    try {
        console.log("---voice fallback---");
        res.status(200).json({ success:"true" });
    }catch(error){
        res.status(401).json({ error });
    }
}

exports.rtcEvent = async (req, res) => {
    try {
        console.log("---rtc event---");
        res.status(200).json({ success:"true" });
    }catch(error){
        res.status(401).json({ error });
    }
}

exports.verifyStatus = async (req, res) => {
    try {
        console.log("---verify status---");
        res.status(200).json({ success:"true" });
    }catch(error){
        res.status(401).json({ error });
    }
}