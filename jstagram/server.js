/*
 * A simple example of an API-based web app that stores pictures.
 */

'use static';

const express = require('express');
const multer = require('multer');
const readChunk = require("read-chunk");
const fileType = require("file-type");
const { promisify } = require('util');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);

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
app.post('/api/pictures', uploader.single('picfile'), pictureBackend);
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

async function uploadPicture(req, res, fileExt) {
  try {
    const retval = await db.uploadPicture(req.file, req.body.title, fileExt);
    console.log(retval);
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

async function checkIfPicture(req, res){
  const buffer = readChunk.sync(res.req.file.path, 0, fileType.minimumBytes);
  const file_type = fileType(buffer);
    try{
    return [config.supported_file_types.includes(file_type.ext), file_type.ext];
  }
  catch (TypError){
    return [false, ""];
  }

}

async function pictureBackend(req, res){
  if (res.req.file === undefined){
    res.status(415).send({error: "File required"});
    return
  }

  if (res.req.body.title === undefined){
    res.status(400).send({error: "Title required"});
    return
  }

  if (res.req.file.mimetype === undefined){
    res.status(415).send({error: "Unsupported mimetype"});
    return
  }
  else if (res.req.file.mimetype.split("/")[0] !== "image"){
    if (res.req.file.mimetype !== "application/octet-stream"){
      res.status(415).send({error: `'${res.req.file.mimetype.split("/")[1]}' is a unsupported mimetype`});
      return
    }
    console.log(`${res.req.file.mimetype} but ignoring`)
  }

  const is_picture = await checkIfPicture(req, res);
  console.log(`Picture test: ${is_picture}`);

  if (is_picture[0]){
    await uploadPicture(req, res, is_picture[1])
  }
  else{
    await unlinkAsync(res.req.file.path);
    res.status(415).send({error: "Unsupported media type"});
    return
  }
}

function error(res, msg) {
  res.sendStatus(500);
  console.error(msg);
}
