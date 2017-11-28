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
    const container = document.createElement('section');
    container.classList.add('picture');
    window.main.appendChild(container);

    const a = document.createElement('a');
    a.classList.add('img');
    a.href = pic.file;
    container.appendChild(a);

    let el = document.createElement('img');
    el.src = pic.file;
    el.alt = pic.title;
    a.appendChild(el);

    el = document.createElement('p');
    el.classList.add('title');
    el.textContent = pic.title;
    container.appendChild(el);

    el = document.createElement('div');
    el.classList.add('delete');
    el.textContent = 'X';
    el.dataset.id = pic.id;
    el.onclick = requestDelete;
    container.appendChild(el);
  });

  const container = document.createElement('section');
  container.classList.add('picture');
  container.classList.add('upload');
  window.main.appendChild(container);

  const el = document.createElement('a');
  el.href = '/upload';
  el.textContent = 'upload a new picture';
  container.appendChild(el);
}

async function requestDelete(e) {
  if (e.target.dataset.id && window.confirm('Realy delete this image?')) {
    await fetch('/api/pictures/' + e.target.dataset.id, { method: 'DELETE' });
    loadPictures();
  }
}
