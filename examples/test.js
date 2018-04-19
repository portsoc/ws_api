/* global require ok test deepEqual notDeepEqual equal */

'use strict';

const dir = './';
const pathInMemory = 'model-inmemory.js';
const pathServer = 'server.js';
const pathImage = __dirname;
const GONE = { status: 'gone' };

const fs = require('fs');

const db = require(dir + pathInMemory);

test(
  'Check if the `model-inmemory.js` file is loaded correctly.',
  () => {
    try {
      fs.accessSync(dir + 'examples/' + pathInMemory, fs.F_OK);
      ok(true, pathInMemory + ' is here.');
    } catch (e) {
      ok(false, pathInMemory + ' is missing');
    }
  },
);

test(
  'Check if the `server.js` file is loaded correctly.',
  () => {
    try {
      fs.accessSync(dir + 'examples/' + pathServer, fs.F_OK);
      ok(true, pathServer + ' is here.');
    } catch (e) {
      ok(false, pathServer + ' is missing');
    }
  },
);

test(
  '`listPictures()`.',
  () => {
    deepEqual(
      db.listPictures(db.title, 'asc'),
      [
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
      ],
      'It works in ascending order.',
    );

    notDeepEqual(
      db.listPictures(db.title, 'asc'),
      [
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
      ],
      'It does not work in ascending order.',
    );

    deepEqual(
      db.listPictures(db.title, 'a2z'),
      [
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
      ],
      'It works in ascending order.',
    );

    deepEqual(
      db.listPictures(db.title, 'desc'),
      [
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
      ],
      'It works in descending order.',
    );
    deepEqual(
      db.listPictures(db.title, 'z2a'),
      [
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
      ],
    );

    notDeepEqual(
      db.listPictures(db.title, 'desc'),
      [
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
      ],
      'It does not work in descending order.',
    );

    deepEqual(
      db.listPictures(db.title),
      [
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
      ],
      'The default case works.',
    );

    deepEqual(
      db.listPictures(db.title, 'old'),
      [
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
      ],
      'It works in order from oldest to newest.',
    );

    equal(
      db.listPictures(db.title, 'random').length,
      4,
      'Returns the good number of values when random.',
    );
    equal(
      db.listPictures(db.title, 'rnd').length,
      4,
    );

    deepEqual(
      db.listPictures(db.title, 'new'),
      [
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
      ],
      'It works in order from newest to oldest.',
    );
  },
);

test(
  '`uploadPicture()`.',
  async () => {
    const picture = {
      mimetype: 'image/png',
      filename: 'toDelete',
      path: pathImage + '/webpages/img/toDelete.png',
    };

    try {
      const file = fs.openSync(picture.path, 'w');
      fs.close(file);
    } catch (e) {
      console.log(e);
    }

    deepEqual(
      await db.uploadPicture(picture, 'testTitle', 'testAuthor'),
      { id: 5, title: 'testTitle', file: '/img/toDelete.png' },
      'The picture was correctly uploaded.',
    );

    deepEqual(
      db.listPictures(db.title, 'new'),
      [
        { id: 5, title: 'testTitle', file: '/img/toDelete.png' },
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
      ],
      'The picture is in the memory.',
    );

    picture.path = 'wrongpath/wrongimage.png';
    picture.filename = 'wrongimage';

    try {
      await db.uploadPicture(picture, 'testTitle', 'testAuthor');
      ok(false, 'It didn\'t throw anything.');
    } catch (e) {
      ok(e[0] === 'failed to move incoming file', 'It threw the right exception.');
    }
  },
);

test(
  '`deletePicture()`.',
  async () => {
    await db.deletePicture(5);

    deepEqual(
      db.listPictures(db.title, 'new'),
      [
        { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
        { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
        { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
        { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
      ],
      'The picture was deleted.',
    );

    try {
      await db.deletePicture(6);
      ok(false, 'It didn\'t throw anything.');
    } catch (e) {
      deepEqual(e, GONE, 'It threw the right exception GONE.');
    }

    const wrongPicture = {
      mimetype: 'image/png',
      filename: 'toDelete2',
      path: pathImage + '/webpages/img/toDelete2.png',
    };

    try {
      const file = fs.openSync(wrongPicture.path, 'w');
      fs.close(file);
      await db.uploadPicture(wrongPicture, 'testThrowException', 'students');
      fs.unlinkSync(wrongPicture.path);
    } catch (e) {
      console.log(e);
    }


    try {
      await db.deletePicture(6);
      ok(false, 'It didn\'t throw anything.');
    } catch (e) {
      deepEqual(e[0], 'failed fs delete of ' + wrongPicture.path, 'It threw the right exception FS.');
    }
  },
);
