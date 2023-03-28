const dotenv = require('dotenv');
dotenv.config();

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const client = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

exports.sendEmail = async ( envelope ) => {
    const { from, to, subject, template, variables } = envelope;


    const messageData = {
        from: from,
        to: to,
        subject: subject,
        template: template,
        'h:X-Mailgun-Variables': variables
    };

    client.messages.create(process.env.MAINGUN_DOMAIN, messageData)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        });
    
};
