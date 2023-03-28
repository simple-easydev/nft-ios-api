/* eslint-disable no-undef */
const express = require('express');

const router = express.Router();
const fs = require('fs');

const adminRoutesPath = `${__dirname}/`;
const { removeExtensionFromFile } = require('../../middleware/utils');

/*
 * Load routes statically and/or dynamically
 */

console.log('Configuring routes...');

router.get('/api/admin/check', (req, res) => {
  res.status(200).json({ message: 'success' });
});

fs.readdirSync(adminRoutesPath).filter((file) => {
  // Take filename and remove last part (extension)
  // Prevents loading of this file and auth file
  async function loadRouters() {
    const routeFile = removeExtensionFromFile(file);
    if (routeFile !== 'index') {
        console.log("admin routeFile ==>",routeFile);
      try {
        const routerModule = await require(`./${routeFile}`);
        router.use(`/api/admin/${routeFile}`, routerModule.default);
        
      } catch (e) {
        console.log('ERROR -->', e);
      }
    }
  }
  loadRouters();
});

exports.routes = router;