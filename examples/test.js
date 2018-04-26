/* global QUnit */

'use strict';

/* eslint-disable import/no-extraneous-dependencies */

const pathImage = __dirname;
const GONE = { status: 'gone' };

const fs = require('fs');
const fetch = require('node-fetch');

const db = require('./model-inmemory.js');

const initialData = [
  { id: 1, title: 'I caught a little fish...', file: '/img/1.png' },
  { id: 2, title: 'The fish I caught was this big.', file: '/img/2.png' },
  { id: 3, title: 'The fish I caught was quite big.', file: '/img/3.png' },
  { id: 4, title: 'I caught the biggest fish you\'ve ever seen.', file: '/img/4.png' },
];

function arrayInOrder(arr, order) {
  const retval = [];
  for (const id of order) {
    retval.push(arr.find((x) => {
      return x.id === id;
    }));
  }
  return retval;
}

QUnit.module('in-memory model');

// These tests depend on the initial data in `model-inmemory.js`
QUnit.test(
  '`listPictures()`.',
  (assert) => {
    assert.deepEqual(
      db.listPictures(null, 'asc'),
      arrayInOrder(initialData, [1, 4, 3, 2]),
      'It works in ascending order.',
    );

    assert.deepEqual(
      db.listPictures(null, 'a2z'),
      arrayInOrder(initialData, [1, 4, 3, 2]),
      'It works when we use the alias `a2z`.',
    );

    assert.deepEqual(
      db.listPictures(null, 'desc'),
      arrayInOrder(initialData, [2, 3, 4, 1]),
      'It works in descending order.',
    );

    assert.deepEqual(
      db.listPictures(null),
      arrayInOrder(initialData, [4, 3, 2, 1]),
      'The default case works.',
    );

    assert.deepEqual(
      db.listPictures(null, 'old'),
      arrayInOrder(initialData, [1, 2, 3, 4]),
      'It works in order from oldest to newest.',
    );

    assert.equal(
      db.listPictures(null, 'rnd').length,
      4,
      'Returns the good number of values when random.',
    );

    assert.deepEqual(
      arrayInOrder(db.listPictures(db.title, 'rnd'), [1, 2, 3, 4]),
      arrayInOrder(initialData, [1, 2, 3, 4]),
      'It works when we try a random',
    );

    assert.deepEqual(
      db.listPictures(null, 'new'),
      arrayInOrder(initialData, [4, 3, 2, 1]),
      'It works in order from newest to oldest.',
    );
  },
);

/*
* Here, we have created one image to test the upload function below
* and another one to test an exception for the `deletePicture` function.
* The last upload here must send an exception because we don't create the file for this test.
*/
QUnit.test(
  '`uploadPicture()`.',
  async (assert) => {
    const picture = {
      mimetype: 'image/png',
      filename: 'toDelete',
      path: pathImage + '/webpages/img/toDelete.png',
    };

    const file = fs.openSync(picture.path, 'w');
    fs.closeSync(file);

    const exists = fs.existsSync(pathImage + '/webpages/img/toDelete.png');
    assert.ok(exists, 'The file `toDelete.png` is in the good place.');

    initialData.push({ id: 5, title: 'testTitle', file: '/img/toDelete.png' });

    assert.deepEqual(
      await db.uploadPicture(picture, 'testTitle', 'testAuthor'),
      { id: 5, title: 'testTitle', file: '/img/toDelete.png' },
      'The picture was correctly uploaded.',
    );

    assert.deepEqual(
      db.listPictures(null, 'new'),
      arrayInOrder(initialData, [5, 4, 3, 2, 1]),
      'The picture is in the memory.',
    );

    picture.path = 'wrongpath/wrongimage.png';
    picture.filename = 'wrongimage';

    try {
      await db.uploadPicture(picture, 'testTitle', 'testAuthor');
      assert.ok(false, 'uploadPicture should have thrown an exception.');
    } catch (e) {
      assert.ok(
        e[0] === 'failed to move incoming file',
        'It threw the right exception : `failed to move incoming file`.',
      );
    }
  },
);

initialData.splice(5);

// Here, we will use both images created before to try the `deletePicture` function.
QUnit.test(
  '`deletePicture()`.',
  async (assert) => {
    await db.deletePicture(5);

    const exists = fs.existsSync(pathImage + '/webpages/img/toDelete.png');
    assert.ok(!exists, 'The file `toDelete.png` has been deleted.');

    assert.deepEqual(
      db.listPictures(null, 'new'),
      arrayInOrder(initialData, [4, 3, 2, 1]),
      'The picture was deleted.',
    );

    try {
      await db.deletePicture(6);
      assert.ok(false, 'deletePicture should have thrown an exception.');
    } catch (e) {
      assert.deepEqual(e, GONE, 'It threw the right exception GONE.');
    }

    const wrongPicture = {
      mimetype: 'image/png',
      filename: 'toDelete2',
      path: pathImage + '/webpages/img/toDelete2.png',
    };

    const file = fs.openSync(wrongPicture.path, 'w');
    fs.closeSync(file);
    await db.uploadPicture(wrongPicture, 'testThrowException', 'students');
    fs.unlinkSync(wrongPicture.path);

    try {
      await db.deletePicture(6);
      assert.ok(false, 'deletePicture should have thrown an exception.');
    } catch (e) {
      assert.deepEqual(e[0], 'failed fs delete of ' + wrongPicture.path, 'It threw the right exception FS.');
    }
  },
);

QUnit.module('API');

QUnit.test(
  'GET /api/pictures',
  async (assert) => {
    // start the server
    const server = require('./server'); // eslint-disable-line global-require
    await delay(1000); // wait for the server to start

    const response = await fetch('http://localhost:8080/api/pictures');
    assert.ok(response.ok, 'GET on /api/pictures is OK');

    assert.deepEqual(
      await response.json(),
      arrayInOrder(initialData, [4, 3, 2, 1]),
      'Without any parameters, it returns from newest to oldest.',
    );

    server.stopServer();
  },
);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
