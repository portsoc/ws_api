/* global require ok test deepEqual equal */

'use strict';

const pathImage = __dirname;
const GONE = { status: 'gone' };

const fs = require('fs');

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

// These tests depend on the initial data in `model-inmemory.js`
test(
  '`listPictures()`.',
  () => {
    deepEqual(
      db.listPictures(null, 'asc'),
      arrayInOrder(initialData, [1, 4, 3, 2]),
      'It works in ascending order.',
    );

    deepEqual(
      db.listPictures(null, 'a2z'),
      arrayInOrder(initialData, [1, 4, 3, 2]),
      'It works when we use the alias `a2z`.',
    );

    deepEqual(
      db.listPictures(null, 'desc'),
      arrayInOrder(initialData, [2, 3, 4, 1]),
      'It works in descending order.',
    );

    deepEqual(
      db.listPictures(null),
      arrayInOrder(initialData, [4, 3, 2, 1]),
      'The default case works.',
    );

    deepEqual(
      db.listPictures(null, 'old'),
      arrayInOrder(initialData, [1, 2, 3, 4]),
      'It works in order from oldest to newest.',
    );

    equal(
      db.listPictures(null, 'rnd').length,
      4,
      'Returns the good number of values when random.',
    );

    deepEqual(
      arrayInOrder(db.listPictures(db.title, 'rnd'), [1, 2, 3, 4]),
      arrayInOrder(initialData, [1, 2, 3, 4]),
      'It works when we try a random',
    );

    deepEqual(
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

    try {
      const exists = fs.existsSync(pathImage + '/webpages/img/toDelete.png');
      ok(exists, 'The file `toDelete.png` is in the good place.');
    } catch (e) {
      ok(false, 'The file `toDelete.png` is not at the good place.');
    }

    initialData.push({ id: 5, title: 'testTitle', file: '/img/toDelete.png' });

    deepEqual(
      await db.uploadPicture(picture, 'testTitle', 'testAuthor'),
      { id: 5, title: 'testTitle', file: '/img/toDelete.png' },
      'The picture was correctly uploaded.',
    );

    deepEqual(
      db.listPictures(null, 'new'),
      arrayInOrder(initialData, [5, 4, 3, 2, 1]),
      'The picture is in the memory.',
    );

    picture.path = 'wrongpath/wrongimage.png';
    picture.filename = 'wrongimage';

    try {
      await db.uploadPicture(picture, 'testTitle', 'testAuthor');
      ok(false, 'uploadPicture should have thrown an exception.');
    } catch (e) {
      ok(e[0] === 'failed to move incoming file', 'It threw the right exception : `failed to move incoming file`.');
    }
  },
);

initialData.splice(5);

// Here, we will use both images created before to try the `deletePicture` function.
test(
  '`deletePicture()`.',
  async () => {
    await db.deletePicture(5);

    const notExists = fs.existsSync(pathImage + '/webpages/img/toDelete.png');
    if (notExists === false) {
      ok(true, 'The file `toDelete.png` has been deleted.');
    } else {
      ok(false, 'We can still find the picture `toDelete.png`.');
    }

    deepEqual(
      db.listPictures(null, 'new'),
      arrayInOrder(initialData, [4, 3, 2, 1]),
      'The picture was deleted.',
    );

    try {
      await db.deletePicture(6);
      ok(false, 'deletePicture should have thrown an exception.');
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
      ok(false, 'deletePicture should have thrown an exception.');
    } catch (e) {
      deepEqual(e[0], 'failed fs delete of ' + wrongPicture.path, 'It threw the right exception FS.');
    }
  },
);
