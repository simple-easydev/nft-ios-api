
const { matchedData } = require('express-validator');
const { Sequelize } = require('sequelize');
const { sequelize } = require('models/db');
const { randomNoRepeats } = require("helper");
const { moveTempFileToUpload } = require('helper/file');

const Op = Sequelize.Op;
const { Reports } = require("models/report");

exports.report = async (req, res) => {

    const { id } = req.user;
    const data = matchedData(req);
    data.reporter_id = id;

    try {
        if(data.screenshot_url){
            data.screenshot_url = await moveTempFileToUpload(data.screenshot_url)
        }
        const report = await Reports.create(data);
        res.status(200).json(report);
    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }
}