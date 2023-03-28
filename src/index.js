require('app-module-path').addPath('src');

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const adminRoutes = require('route/admin');
const clientRoutes = require('route/client');
const vonageRoutes = require('route/vonage');
const db = require("models/db");

// initialize configuration
dotenv.config();

// eslint-disable-next-line no-undef
const port = process.env.SERVER_PORT;


// for parsing json
express.json({limit:'10mb'});
express.urlencoded({ extended: true, limit: '10mb' });

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 1 * 1024 * 1024 * 1024 },
}));
app.use([adminRoutes.routes, clientRoutes.routes, vonageRoutes.routes]);

db.connect(()=>{
  app.listen(port, ()=>{
      // Prints initialization
      console.log('****************************');
      console.log('*    Starting Server');
      console.log(`*    Port: ${process.env.SERVER_PORT || 3000}`);
      console.log(`*    NODE_ENV: ${process.env.NODE_ENV}`);
  });

})