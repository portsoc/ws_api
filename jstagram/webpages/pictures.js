(function () {
  'use strict';

  const elSearchnow = document.querySelector('#searchnow');
  const elSearchform = document.querySelector('#searchform');
  const elSort = document.querySelector('#sort');
  const elSearch = document.querySelector('#search');
  const elMain = document.querySelector('main');
  const elUpload = document.querySelector('#upload');
  const btnUpload = document.querySelector('button.upload');
  const btnCancel = document.querySelector('button.cancel');
  const elTitle = elUpload.querySelector('input#title');
  const elPreview = elUpload.querySelector('.preview');

  window.addEventListener('load', init);

  function init() {
    elSearchnow.addEventListener('click', loadPicturesWithSearch);
    elSearchform.addEventListener('submit', loadPicturesWithSearch);
    elSort.addEventListener('change', loadPictures);

    document.body.addEventListener('dragover', dragOver);
    document.body.addEventListener('dragenter', dragEnter);
    document.body.addEventListener('dragleave', dragLeave);
    document.body.addEventListener('drop', drop);

    btnUpload.addEventListener('click', uploadDraggedFile);
    btnCancel.addEventListener('click', cancelUpload);

    loadPictures();
  }

  function loadPicturesWithSearch(e) {
    e.preventDefault();
    loadPictures();
  }

  async function loadPictures() {
    try {
      elMain.classList.add('loading');
      let url = '/api/pictures';
      url += '?order=' + elSort.selectedOptions[0].value;
      if (elSearch.value) url += '&title=' + encodeURIComponent(elSearch.value);

      const response = await fetch(url);
      if (!response.ok) throw response;
      elMain.classList.remove('loading');
      putPicturesInPage(await response.json());
    } catch (e) {
      console.error('error getting pictures', e);
      elMain.classList.remove('loading');
      elMain.classList.add('error');
    }
  }

  function putPicturesInPage(pics) {
    // clear out old pictures
    for (const old of elMain.querySelectorAll('section.picture')) {
      old.remove();
    }

    // install new ones in the order they came
    pics.forEach((pic) => {
      const container = document.createElement('section');
      container.classList.add('picture');
      elMain.appendChild(container);

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
  }

  async function requestDelete(e) {
    if (e.target.dataset.id && window.confirm('Realy delete this image?')) {
      await fetch('/api/pictures/' + e.target.dataset.id, { method: 'DELETE' });
      loadPictures();
    }
  }


  function isDragAcceptable(e) {
    return e.dataTransfer.items.length > 0
      && e.dataTransfer.items[0].type.startsWith('image/');
  }

  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.effectAllowed = 'copy';

    if (elUpload.contains(e.target) && !isDragAcceptable(e)) {
      elUpload.classList.add('highlight-deny');
    }
  }

  let dragDepth = 0;

  function dragEnter(e) {
    file = null;
    elUpload.classList.remove('confirm');
    elUpload.classList.add('highlight-for-drop');
    dragDepth += 1;

    if (elUpload.contains(e.target) && !isDragAcceptable(e)) {
      elUpload.classList.add('highlight-deny');
    }
  }

  function dragLeave(e) {
    dragDepth -= 1;
    if (dragDepth === 0) {
      elUpload.classList.remove('highlight-for-drop');
    }

    if (e.target === elUpload) {
      elUpload.classList.remove('highlight-deny');
    }
  }

  let file = null;

  function drop(e) {
    dragDepth = 0;
    elUpload.classList.remove('highlight-for-drop');
    elUpload.classList.remove('highlight-deny');
    e.preventDefault();

    if (!elUpload.contains(e.target)) return; // dropped outside of the upload zone

    if (!isDragAcceptable(e)) return; // don't allow the drop

    // get a title for the file
    file = e.dataTransfer.items[0].getAsFile();

    elUpload.classList.add('confirm');
    elTitle.value = file.name || '';
    elTitle.focus();
    elTitle.select();
    elPreview.innerHTML = '';

    // put a preview of the image in the page
    const reader = new FileReader();
    // wait a bit so browser shows that it's accepted the file and is generating a preview
    setTimeout(() => reader.readAsDataURL(file), 50);
    reader.onload = () => {
      const imgEl = document.createElement('img');
      imgEl.src = reader.result;
      imgEl.alt = file.name || 'uploaded image';
      elPreview.appendChild(imgEl);
    };

    // todo handle the dropped file, upload it
  }

  async function uploadDraggedFile(e) {
    e.preventDefault();
    if (!file) return;
    if (!elTitle.reportValidity()) return;

    // now the real upload
    const data = new FormData();
    data.append('picfile', file);
    data.append('title', elTitle.value);

    btnCancel.disabled = true;
    btnUpload.disabled = true;

    await fetch('/api/pictures', {
      method: 'POST',
      body: data,
    });

    // clean up
    cancelUpload();

    loadPictures();
  }

  function cancelUpload(e) {
    if (e) e.preventDefault();
    elUpload.classList.remove('highlight-for-drop');
    elUpload.classList.remove('highlight-deny');
    elUpload.classList.remove('confirm');
    btnCancel.disabled = false;
    btnUpload.disabled = false;
    file = null;
  }
}());
