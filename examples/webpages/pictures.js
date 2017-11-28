'use strict';

window.addEventListener('load', init);

function init() {
  window.searchnow.addEventListener('click', loadPicturesWithSearch);
  window.searchform.addEventListener('submit', loadPicturesWithSearch);
  window.sort.addEventListener('change', loadPictures);
  loadPictures();
}

function loadPicturesWithSearch(e) {
  e.preventDefault();
  loadPictures();
}

async function loadPictures() {
  try {
    window.main.innerHTML = 'loading...';
    let url = '/api/pictures';
    url += '?order=' + window.sort.selectedOptions[0].value;
    if (window.search.value) url += '&title=' + encodeURIComponent(window.search.value);

    const response = await fetch(url);
    if (!response.ok) throw response;
    putPicturesInPage(await response.json());
  } catch (e) {
    console.error('error getting pictures', e);
    window.main.innerHTML = 'sorry, something went wrong...';
  }
}

function putPicturesInPage(pics) {
  // clear out old pictures
  window.main.innerHTML = '';

  // install new ones in the order they came
  pics.forEach((pic) => {
    const template = document.querySelector('#picture_t');
    const newEl = document.importNode(template.content, true).children[0];

    newEl.querySelector('a.img').href = pic.file;
    newEl.querySelector('a.img > img').src = pic.file;
    newEl.querySelector('a.img > img').alt = pic.title;
    newEl.querySelector('p.title').textContent = pic.title;
    newEl.querySelector('div.delete').dataset.id = pic.id;
    newEl.querySelector('div.delete').onclick = requestDelete;

    window.main.appendChild(newEl);
  });

  const template = document.querySelector('#upload_t');
  const newEl = document.importNode(template.content, true).children[0];
  window.main.appendChild(newEl);
}

async function requestDelete(e) {
  if (e.target.dataset.id && window.confirm('Realy delete this image?')) {
    await fetch('/api/pictures/' + e.target.dataset.id, { method: 'DELETE' });
    loadPictures();
  }
}
