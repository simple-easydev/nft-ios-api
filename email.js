const API_KEY = 'c99b2e8a3e8b91c63e405f948f72737d-602cc1bf-dd5d2e4d';
const DOMAIN = 'rellanft.xyz';

const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const client = mailgun.client({username: 'api', key: API_KEY});

const messageData = {
  from: 'support@rellanft.xyz',
  to: 'heavy.sheng.yu@gmail.com',
  subject: 'Hello',
  text: 'test mailgun email'
};

client.messages.create(DOMAIN, messageData)
 .then((res) => {
   console.log(res);
 })
 .catch((err) => {
   console.error(err);
 });
