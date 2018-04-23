'use strict';

fetch = () => {
  return {
    ok: true,
    json() { return []; },
  };
};

const baseMainChildrenNumber = document.querySelector('main').childElementCount;

QUnit.module('Pictures');

QUnit.test(
  'putPicturesInPage',
  (assert) => {
    assert.ok(
      typeof window.forTesting.putPicturesInPage === 'function',
      '`putPicturesInPage` takes an array of picture objects and puts them as sections in <main>.',
    );

    const elM = document.querySelector('main');
    assert.strictEqual(
      elM.childElementCount,
      (0+baseMainChildrenNumber),
      'Before using the function, the element `main` must be empty of pictures.',
    );
    assert.ok(
      document.querySelector('main .picture') == null,
    );

    // with an empty array
    window.forTesting.putPicturesInPage([]);
    const el = document.querySelectorAll('main section.picture');

    assert.strictEqual(
      el.length,
      (0),
      'When there is no picture to be added, there must be only the base code of the page.',
    );

    // with an array of one picture
    let data = [{
      id: 1,
      file: 'http://placebear.com/400/200',
      title: 'A bear',
    }];
    window.forTesting.putPicturesInPage(data);

    assert.strictEqual(
      elM.childElementCount,
      (1+baseMainChildrenNumber),
      'After passing one image entity to the function, there must be only one `section`.',
    );

    let listOfSections = elM.querySelectorAll('section.picture');
    let section = listOfSections[0];
    let paragraphs = section.querySelectorAll('p');
    let as = section.querySelectorAll('a');
    let images = as[0].querySelectorAll('img');
    let deletes = section.querySelectorAll('div');

    assert.ok(
      section.classList.contains('picture'),
      'A `section` must have the class `picture`.',
    );

    assert.strictEqual(
      paragraphs.length,
      1,
      'There must be one `<p>` element in a `section`.',
    );
    assert.strictEqual(
      paragraphs[0].className,
      'title',
      'The first paragraph must have the class `title`',
    );

    assert.strictEqual(
      as.length,
      1,
      'There must be one `<a>` element in a `section`.',
    );
    assert.ok(
      as[0].classList.contains('img'),
      'The `<a>` element must have the class `img`.',
    );
    assert.strictEqual(
      as[0].href,
      data[0].file,
      'The `<a>` element must have its `href` attribute set to the good value.',
    );

    assert.strictEqual(
      images.length,
      1,
      'In a `<a>` element there must be only one image.',
    );
    assert.strictEqual(
      images[0].src,
      data[0].file,
      'The `<img>` element must have its `src` attribute set to the link of the image.',
    );
    assert.strictEqual(
      images[0].alt,
      data[0].title,
      'The `<img>` element must have its `alt` attribute set to the title of the image.',
    );

    assert.strictEqual(
      deletes.length,
      1,
      'There must be only one `<div>` that displays an X in the `section`.',
    );
    assert.ok(
      deletes[0].classList.contains('delete'),
      'The `div` must have the class `delete`.',
    );
    assert.strictEqual(
      deletes[0].textContent,
      'X',
      'The content of the `div` is `X`.',
    );
    assert.strictEqual(
      deletes[0].dataset.id,
      String(data[0].id),
      'The `dataset.id` attribute of the `div` must be set to the `id` of the image.',
    );
    assert.strictEqual(
      deletes[0].onclick,
      window.forTesting.requestDelete,
      'When clicking the `X`, the `requestDelete` function must run.',
    );

    // with an array of two pictures
    data = [{
      id: 1,
      file: 'http://placebear.com/400/200',
      title: 'A bear',
    },
    {
      id: 2,
      file: 'https://placebear.com/200/200',
      title: 'Another bear',
    }];
    window.forTesting.putPicturesInPage(data);

    assert.strictEqual(elM.childElementCount, (2+baseMainChildrenNumber), 'After passing two image entity to the function, there must be two sections.');

    listOfSections = elM.querySelectorAll('section.picture');
    section = listOfSections[1];
    paragraphs = section.querySelectorAll('p');
    as = section.querySelectorAll('a');
    images = as[0].querySelectorAll('img');
    deletes = section.querySelectorAll('div');

    assert.strictEqual(listOfSections.length, 2);
    assert.ok(section.classList.contains('picture'));
    assert.strictEqual(paragraphs.length, 1);
    assert.strictEqual(paragraphs[0].className, 'title');
    assert.strictEqual(as.length, 1);
    assert.ok(as[0].classList.contains('img'));
    assert.strictEqual(as[0].href, data[1].file);
    assert.strictEqual(images.length, 1);
    assert.strictEqual(images[0].src, data[1].file);
    assert.strictEqual(images[0].alt, data[1].title);
    assert.strictEqual(deletes.length, 1);
    assert.ok(deletes[0].classList.contains('delete'));
    assert.strictEqual(deletes[0].textContent, 'X');
    assert.strictEqual(deletes[0].dataset.id, String(data[1].id));
    assert.strictEqual(deletes[0].onclick, window.forTesting.requestDelete);
  },
);
