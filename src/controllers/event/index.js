
const { User, NotificationSetting } = require("models/users");
const auth = require("middleware/auth");

const { matchedData } = require('express-validator');

const { Sequelize, QueryTypes } = require('sequelize');
const { Event } = require("models/event");
const { Media } = require("models/media");
const Location = require("models/location");
const { Categories } = require("models/categories");
const { moveTempFileToUpload } = require("helper/file");
const { sequelize } = require('models/db');
const Op = Sequelize.Op;

exports.create = async (req, res) => {
    const data = matchedData(req);
    
    try {

        const event = await Event.create(data);

        if(data.media_url){
            data.media_url = await moveTempFileToUpload(data.media_url)
        }
        if(data.thumbnail_url){
            data.thumbnail_url = await moveTempFileToUpload(data.thumbnail_url)
        }

        if (data.media_url || data.thumbnail_url) {
            
            const media = await Media.create({ media_url: data.media_url, media_type_id: data.media_type_id, thumbnail_url: data.thumbnail_url });
            event.media_id = media.id;

        }

        if(data.location){
            // data.location.geo = "POINT(" + data.location.lng + " " + data.location.lat + ")";       // mariadb geospatial gramma (local xampp)
            data.location.geo = "POINT(" + data.location.lat + " " + data.location.lng + ")";       // mysql geospatial gramma (online server)

            var location = await Location.findOne({
                where: { poi: data.location.poi }
            })

            if (!location) {
                location = await Location.create(data.location);
            }
            event.location_id = location.id;
        }

        await event.save();

        res.status(200).json(event);
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.getEvents = async (req, res) => {

    const { lat, lng, radius, category_id } = matchedData(req);
    const whereFilter = [];
    if (category_id) {
        whereFilter.push({"event_category_id": category_id})
    }

    const location = sequelize.literal(`ST_GeomFromText('POINT(${lat} ${lng})', 4326)`);        // mysql geospatial gramma
    const geo = sequelize.literal(`ST_GeomFromText(location.geo, 4326)`);
    const distance = sequelize.fn('ST_Distance_Sphere', geo, location);
    const nearByFilter = [ sequelize.where(distance, "<", radius) ];
    
    try {
        const events = await Event.findAll({
            include: [
                {
                    model: Media
                },
                {
                    model: Location,
                    attributes:{
                        include: [
                            [distance, 'distance']
                        ] 
                    },
                    where: nearByFilter,
                },
                {
                    model: Categories
                }
            ],
            where: whereFilter,
            order: [['event_time', 'DESC']]
        });

        res.status(200).json(events);
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.searchEvents = async (req, res) => {
    
    const { text } = matchedData(req);

    try {

        const events = await Event.findAll({
            include: [
                {
                    model: Media
                },
                {
                    model: Location
                }
            ],
            where: {
                [Op.or]: [
                    {
                        title:  {
                            [Op.substring]: text
                        }
                    },
                    {
                        description:  {
                            [Op.substring]: text
                        }
                    }
                ]
            },
            order: [["event_category_id", 'ASC']]
        });

        res.status(200).json(events);
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}
