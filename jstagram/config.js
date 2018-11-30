'use strict';

const path = require('path');

// mysql
module.exports.mysql = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  charset: 'UTF8MB4',
  database: 'pictures',
  // socketPath: '/tmp/mysql.sock', // uncomment this when testing with local non-networked mysql
};

// constants for directories
module.exports.webpages = path.join(__dirname, '/webpages/');
module.exports.localimg = module.exports.webpages + 'img/';
module.exports.webimg = '/img/';
module.exports.uploads = path.join(__dirname, '/uploads/');

// todo make the above functions that use path.join to produce full paths
