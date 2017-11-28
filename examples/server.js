/*
 * A simple example of an API-based web app that stores pictures.
 */

'use static';

const express = require('express');
const multer = require('multer');

const db = require('./model-inmemory');
const config = require('./config');

const app = express();


// multer is a package that handles file uploads nicely
const uploader = multer({
  dest: config.uploads,
  limits: { // for security
    fields: 10,
    fileSize: 1024*1024*20,
    files: 1,
  },
});

// logging
app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });


// server api
//   POST /api/pictures     - upload a picture and its title, returns {id: ..., title: ..., file: '/img/...'}
//   GET  /api/pictures     - list pictures ordered by time from most recent, returns [like above, like above, ...]
//         ?order=...       - ordered by title or submission time or random
//         ?title=...       - search by title substring
//   DELETE /api/pictures/x - returns http status code only

app.get('/api/pictures', sendPictures);
app.post('/api/pictures', uploader.single('picfile'), uploadPicture);
app.delete('/api/pictures/:id', deletePicture);


// static files
app.use('/', express.static(config.webpages, { extensions: ['html'] }));

// start the server
app.listen(8080, (err) => {
  if (err) console.error('error starting server', err);
  else console.log('server started');
});


/* server functions
 *
 *
 *    ####  ###### #####  #    # ###### #####     ###### #    # #    #  ####  ##### #  ####  #    #  ####
 *   #      #      #    # #    # #      #    #    #      #    # ##   # #    #   #   # #    # ##   # #
 *    ####  #####  #    # #    # #####  #    #    #####  #    # # #  # #        #   # #    # # #  #  ####
 *        # #      #####  #    # #      #####     #      #    # #  # # #        #   # #    # #  # #      #
 *   #    # #      #   #   #  #  #      #   #     #      #    # #   ## #    #   #   # #    # #   ## #    #
 *    ####  ###### #    #   ##   ###### #    #    #       ####  #    #  ####    #   #  ####  #    #  ####
 *
 *
 */

async function sendPictures(req, res) {
  try {
    const pictures = await db.listPictures(req.query.title, req.query.order);
    res.json(pictures);
  } catch (e) {
    error(res, e);
  }
}

async function deletePicture(req, res) {
  try {
    await db.deletePicture(req.params.id);
    res.sendStatus(200);
  } catch (e) {
    if (e.status === 'gone') {
      res.sendStatus(410); // already gone
    } else {
      error(res, e);
    }
  }
}

async function uploadPicture(req, res) {
  try {
    const retval = await db.uploadPicture(req.file, req.body.title);
    if (req.accepts('html')) {
      // browser should go to the listing of pictures
      res.redirect(303, '/#' + retval.id);
    } else {
      // request that accepts JSON will instead get the data
      res.json(retval);
    }
  } catch (e) {
    error(res, e);
  }
}

function error(res, msg) {
  res.sendStatus(500);
  console.error(msg);
}
