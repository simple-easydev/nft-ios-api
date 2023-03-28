const { matchedData } = require('express-validator');

const { Subscription } = require('models/subscription');

const { Sequelize } = require('sequelize');

const Op = Sequelize.Op;

exports.createSubscription = async (req, res) => {

    const { id } = req.user;
    const data = matchedData(req);

    try {
        var subscription = await Subscription.findOne({
            where: { user_id: data.user_id, subscriber_id: id }
        })
        // const subscription = await Subscription.create({ ...data, subscriber_id: id });
        if (subscription) {
            subscription.expire_date = data.expire_date;
            await subscription.save();
        } else {
            subscription = await Subscription.create({ ...data, subscriber_id: id });
        }

        res.status(200).json(subscription);

    }catch(error){
        console.log(error);
        res.status(401).json({ error });
    }

}

exports.getSubscriptionState = async (req, res) => {

    const { id } = req.user;
    const { user_id } = req.params;

    try {
        const subscription = await Subscription.findOne({
            where: { user_id: user_id, subscriber_id: id }
        })
        if (subscription) {
            res.status(200).json(subscription);
        } else {
            res.status(403).json({ "message": "not subscribed" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ error });
    }

}