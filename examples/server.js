/*
 * A simple example of an API-based web app that stores pictures.
 */

'use static';
var fs = require('fs');
var express = require('express');
var multer = require('multer');
var mysql = require('mysql');

var config = require('./sql_config.json');
var sql = mysql.createConnection(config.mysql);

var app = express();

// constants for directories
var webpages = __dirname + '/webpages/';
var localimg = webpages + 'img/';
var webimg = '/img/';
var uploads = __dirname + '/uploads/';

// multer is a package that handles file uploads nicely
var uploader = multer({
  dest: uploads,
  limits: { // for security
    fields: 10,
    fileSize: 1024*1024*20,
    files: 1,
  }
});

// logging
app.use('/', function(req, res, next) { console.log(new Date(), req.method, req.url); next(); });


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
app.use('/', express.static(webpages, { extensions: ['html'] }));

// start the server
app.listen(8080);



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

function sendPictures(req, res) {
  var pictures = [];

  // prepare query
  var query = 'SELECT id, title, filename FROM picture';
  if (req.query.title) {
    query += ' WHERE title LIKE ' + sql.escape('%' + req.query.title + '%');
  }
  var order;
  switch (req.query.order) {
    case 'asc':
    case 'a2z': order = 'title ASC'; break;   // by title a-z
    case 'desc':
    case 'z2a': order = 'title DESC'; break;  // by title z-a
    case 'random':
    case 'rnd': order = 'rand()'; break;      // random order
    case 'old': order = 'id ASC'; break;      // oldest-first (by submission time)
    case 'new':                               // newest-first (by submission time)
    default:    order = 'id DESC';
  }
  query += ' ORDER BY ' + order;
  query += ' LIMIT 10';

  // now query the table and output the results
  sql.query(query, function (err, data) {
    if (err) return error(res, 'failed to run the query', err);

    data.forEach(function (row) {
      pictures.push({
        id: row.id,
        title: row.title,
        file: webimg + row.filename,
      });
    });

    res.json(pictures);
  });
}

function deletePicture(req, res) {
  // get the filename from the table
  sql.query(sql.format('SELECT filename FROM picture WHERE id = ?', [req.params.id]), function (err, data) {
    if (err) return error(res, 'failed to get filename for deletion', err);

    if (data.length < 1) {
      res.sendStatus(410); // already gone
      return;
    }

    var filename = localimg + data[0].filename;

    sql.query(sql.format('DELETE FROM picture WHERE id=?', [req.params.id]), function (err, result) {
      if (err) return error(res, 'failed sql delete', err);

      fs.unlink(filename, function (err) {
        if (err) return error(res, 'failed fs delete of ' + filename, err);

        res.sendStatus(200);
      });
    });
  });
}

function uploadPicture(req, res) {
  // move the file where we want it
  var fileExt = req.file.mimetype.split('/')[1] || 'png';
  var newFilename = req.file.filename + '.' + fileExt;
  fs.rename(req.file.path, localimg + newFilename, function (err) {
    if (err) return error(res, 'failed to move incoming file', err);

    // now add the file to the DB
    var dbRecord = {
      filename: newFilename,
      title: req.body.title
    };

    sql.query(sql.format('INSERT INTO picture SET ?', dbRecord), function (err, result) {
      if (err) return error(res, 'failed sql insert', err);

      if (req.accepts('html')) {
        // browser should go to the listing of pictures
        res.redirect(303, '/#' + result.insertId);
      } else {
        // XML HTTP request that accepts JSON will instead get that
        res.json({id: result.insertedId, title: dbRecord.title, file: webimg + dbRecord.filename});
      }
    });
  });
}

function error(res, msg, error) {
  res.sendStatus(500);
  console.error(msg, error);
}
