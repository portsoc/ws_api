'use strict';

const fs = require('fs');
const util = require('util');
const Postgres = require('pg').Client;
const config = require('./config');

// promisify some filesystem functions
fs.unlinkAsync = fs.unlinkAsync || util.promisify(fs.unlink);
fs.renameAsync = fs.renameAsync || util.promisify(fs.rename);

const sql = new Postgres(config.pgsql);

sql.connect();
sql.on('error', (err) => {
  console.error(err);
  sql.end();
});

module.exports.listPictures = async (title, sort) => {
  let query = 'SELECT id, title, filename FROM picture';
  let param;
  if (title) {
    param = ['%' + title + '%'];
    query += ' WHERE title ILIKE $1 ';
  }
  let order;
  switch (sort) {
    case 'asc':
    case 'a2z': order = 'title ASC'; break;   // by title a-z
    case 'desc':
    case 'z2a': order = 'title DESC'; break;  // by title z-a
    case 'random':
    case 'rnd': order = 'random()'; break;    // random order
    case 'old': order = 'id ASC'; break;      // oldest-first (by submission time)
    case 'new':                               // newest-first (by submission time)
    default:    order = 'id DESC';
  }
  query += ' ORDER BY ' + order;
  query += ' LIMIT 10';

  // now query the table and output the results
  const { rows } = await sql.query(query, param);

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
  // get the filename from the table
  const { rows } = await sql.query('SELECT filename FROM picture WHERE id = $1', [id]);
  if (rows.length < 1) {
    throw GONE;
  }

  const filename = config.localimg + rows[0].filename;

  await sql.query('DELETE FROM picture WHERE id=$1', [id]);
  await fs.unlinkAsync(filename);
};


module.exports.uploadPicture = async (reqFile, title) => {
  // move the file where we want it
  const fileExt = reqFile.mimetype.split('/')[1] || 'png';
  const newFilename = reqFile.filename + '.' + fileExt;
  await fs.renameAsync(reqFile.path, config.localimg + newFilename);

  // now add the file to the DB
  const query = 'INSERT INTO picture (filename, title) values ($1, $2) returning *';
  const dbRecord = [newFilename, title];
  const { rows } = await sql.query(query, dbRecord);
  return { id: rows[0].id, title, file: config.webimg + newFilename };
};
