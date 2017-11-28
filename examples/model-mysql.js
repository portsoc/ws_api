'use strict';

const fs = require('fs');
const mysql = require('mysql');

const config = require('./config');

const sql = mysql.createConnection(config.mysql);

module.exports.listPictures = (title, sort) => {
  return new Promise((resolve, reject) => {
    // prepare query
    let query = 'SELECT id, title, filename FROM picture';
    if (title) {
      query += ' WHERE title LIKE ' + sql.escape('%' + title + '%');
    }
    let order;
    switch (sort) {
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
    sql.query(query, (err, data) => {
      if (err) {
        reject(['failed to run the query', err]);
        return;
      }

      const retval = [];

      data.forEach((row) => {
        retval.push({
          id: row.id,
          title: row.title,
          file: config.webimg + row.filename,
        });
      });

      resolve(retval);
    });
  });
};


const GONE = { status: 'gone' };

module.exports.deletePicture = (id) => {
  return new Promise((resolve, reject) => {
    // get the filename from the table
    sql.query(sql.format('SELECT filename FROM picture WHERE id = ?', [id]), (err, data) => {
      if (err) {
        reject(['failed to get filename for deletion', err]);
        return;
      }

      if (data.length < 1) {
        reject(GONE);
        return;
      }

      const filename = config.localimg + data[0].filename;

      sql.query(sql.format('DELETE FROM picture WHERE id=?', [id]), (err) => {
        if (err) {
          reject(['failed sql delete', err]);
          return;
        }

        fs.unlink(filename, (err) => {
          if (err) {
            reject(['failed fs delete of ' + filename, err]);
            return;
          }

          resolve();
        });
      });
    });
  });
};


module.exports.uploadPicture = (reqFile, title) => {
  return new Promise((resolve, reject) => {
    // move the file where we want it
    const fileExt = reqFile.mimetype.split('/')[1] || 'png';
    const newFilename = reqFile.filename + '.' + fileExt;
    fs.rename(reqFile.path, config.localimg + newFilename, (err) => {
      if (err) {
        reject(['failed to move incoming file', err]);
        return;
      }

      // now add the file to the DB
      const dbRecord = {
        filename: newFilename,
        title,
      };

      sql.query(sql.format('INSERT INTO picture SET ?', dbRecord), (err, result) => {
        if (err) {
          reject(['failed sql insert', err]);
          return;
        }

        resolve({ id: result.insertId, title: dbRecord.title, file: config.webimg + dbRecord.filename });
      });
    });
  });
};
