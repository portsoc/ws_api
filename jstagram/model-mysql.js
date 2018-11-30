'use strict';

const fs = require('fs');
const util = require('util');
const mysql = require('mysql2/promise');

// promisify some filesystem functions
fs.unlinkAsync = fs.unlinkAsync || util.promisify(fs.unlink);
fs.renameAsync = fs.renameAsync || util.promisify(fs.rename);

const config = require('./config');

const sqlPromise = mysql.createConnection(config.mysql);

(async () => {
  const sql = await sqlPromise;
  // handle unexpected errors by just logging them
  sql.on('error', (err) => {
    console.error(err);
    sql.end();
  });
})();

module.exports.listPictures = async (title, sort) => {
  const sql = await sqlPromise;

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
  const [rows] = await sql.query(query);

  return rows.map((row) => {
    return {
      id: row.id,
      title: row.title,
      file: config.webimg + row.filename,
    };
  });
};


const GONE = { status: 'gone' };

module.exports.deletePicture = async (id) => {
  const sql = await sqlPromise;

  // get the filename from the table
  const [rows] = await sql.query(sql.format('SELECT filename FROM picture WHERE id = ?', [id]));
  if (rows.length < 1) {
    throw GONE;
  }

  const filename = config.localimg + rows[0].filename;

  await sql.query(sql.format('DELETE FROM picture WHERE id=?', [id]));
  await fs.unlinkAsync(filename);
};


module.exports.uploadPicture = async (reqFile, title) => {
  const sql = await sqlPromise;

  // move the file where we want it
  const fileExt = reqFile.mimetype.split('/')[1] || 'png';
  const newFilename = reqFile.filename + '.' + fileExt;
  await fs.renameAsync(reqFile.path, config.localimg + newFilename);

  // now add the file to the DB
  const dbRecord = {
    filename: newFilename,
    title,
  };

  const [rows] = await sql.query(sql.format('INSERT INTO picture SET ?', dbRecord));
  return { id: rows.insertId, title: dbRecord.title, file: config.webimg + dbRecord.filename };
};
