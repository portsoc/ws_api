'use strict';

const fs = require('fs');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);


const config = require('./config');

const data = [
  { id: 1, title: 'I caught a little fish...', file: '1.png' },
  { id: 2, title: 'The fish I caught was this big.', file: '2.png' },
  { id: 3, title: 'The fish I caught was quite big.', file: '3.png' },
  { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '4.png' },
];

data.nextId = 5;

const LIMIT = 10;

module.exports.listPictures = (title, sort) => {
  let retval = data.slice(); // copy because we'll be doing things to it

  // filter by title
  if (title) {
    retval = retval.filter((item) => item.title.includes(title));
  }

  // sort
  switch (sort) {
    // by title a-z
    case 'asc':
    case 'a2z': retval.sort(titleAsc); break;

    // by title z-a
    case 'desc':
    case 'z2a': retval.sort(titleDesc); break;

    // random order
    case 'random':
    case 'rnd': retval = randomizeArrayStart(retval, LIMIT); break;

    // oldest-first (by submission time)
    case 'old': break; // no need to do anything

    // newest-first (by submission time)
    case 'new':
    default:    retval = retval.slice(-LIMIT).reverse();
  }

  // only return the first ten results
  if (retval.length > LIMIT) retval.length = LIMIT;

  // prepend url path to file names
  retval = retval.map((item) => ({
    id: item.id,
    title: item.title,
    file: config.webimg + item.file,
  }));

  return retval;
};

// comparator by title, ascending
function titleAsc(a, b) {
  if (a.title<b.title) return -1;
  if (a.title===b.title) return 0;
  return 1;
}

function titleDesc(a, b) {
  return -titleAsc(a, b);
}

function randomizeArrayStart(arr, n) {
  if (n>arr.length) n = arr.length;
  while (n>0) {
    n -= 1;
    const i = Math.floor(Math.random()*arr.length);
    const old = arr[n];
    arr[n] = arr[i];
    arr[i] = old;
  }
  return arr;
}


const GONE = { status: 'gone' };

module.exports.deletePicture = async (id) => {
  if (typeof id !== 'number') id = parseInt(id, 10);
  let index;
  for (let i=0; i<data.length; i+=1) {
    if (data[i].id === id) {
      index = i;
      break;
    }
  }
  if (index == null) {
    throw GONE;
  }

  const filename = config.localimg + data[index].file;
  data.splice(index, 1); // delete the item

  // asynchronously delete the file
  try {
    await unlinkAsync(filename);
  } catch (e) {
    throw ['failed fs delete of ' + filename, e];
  }
};


module.exports.uploadPicture = async (reqFile, title) => {
  // move the file where we want it
  const fileExt = reqFile.mimetype.split('/')[1] || 'png';
  const newFilename = reqFile.filename + '.' + fileExt;

  try {
    await renameAsync(reqFile.path, config.localimg + newFilename);
  } catch (e) {
    throw ['failed to move incoming file', e];
  }

  // now add the file to the DB
  const item = {
    id: data.nextId,
    file: newFilename,
    title,
  };

  data.nextId += 1;
  data.push(item);

  return { id: item.id, title: item.title, file: config.webimg + item.file };
};
