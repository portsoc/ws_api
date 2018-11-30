ws_api
======

JStagram – a simple example of an API-based web app for sharing pictures.

In this code, we are not doing tests, instead you should play with the JStagram example app. For inspiration, here is a list of things you might consider doing in JStagram:


 1. new feature: extend the data models with a function that returns a count of pictures (as shown in slides); extend the HTTP API so the count is available at /api/pictures/count, and extend the page to show the current count of pictures somewhere.
 1. fix: delete an uploaded file if it isn't an image (packages such as [file_type](https://www.npmjs.com/package/file-type) or [jimp](https://www.npmjs.com/package/jimp) may help here).
 2. new feature: add paging to the main page to go beyond the first 10 results (you might want to define query parameter `page` for that)
 3. new feature: add a per-picture page to show a single picture nicely
 4. new feature: look for a thumbnail package and process the image into full resolution for viewing and thumbnail for the index page
 5. new feature if you like databases: make title search full-text - MySQL has fulltext indexes and search functions

NB: if you're choosing an image processing package the benefit of choosing a native JS library is that it will work on any platform.  Conversely the benefit of something that's compiles for a specific OS is native speed.  We tend to favour portability for ease of development by many users.

Running JStagram
----------------

To get the example running, you must install the source code and all modules and then run the server from the command line:

1. To download the code, either use git (the simplest option):

  ```bash
  git clone https://github.com/portsoc/ws_api.git
  cd ws_api
  ```
  or download and unpack the [zip](https://github.com/portsoc/ws_api/archive/master.zip)
  which on linux can be achieved using
  ```bash
  wget https://github.com/portsoc/ws_api/archive/master.zip
  ```
  then
  ```bash
  unzip master.zip
  cd ws_api-master
  ```

2. To download any libraries the code uses, type:

  ```bash
  npm install
  ```

3. Start the server by typing:

  ```bash
  npm start
  ```

4. Visit your website.
    * If you're on your VM you just need to put your VM's IP address into a browser, or if you're developing on a desktop machine it will be http://127.0.0.1:8080 .


Running JStagram with a database
--------------------------------

1. Do the first two steps above

2. Change the mention of `model-inmemory` to `model-mysql` in `server.js`.

3. Install and run MySQL.
    * If you're using your VM for this, MySQL is already installed and running.

4. Edit `jstagram/config.json` so that your database `host`, `user` and `password` properties are correct.
    * The defaults should work on your VM.

5. Install the database and tables using: `npm run initsql`
    * If your `host` and `user` differ from the defaults, you may need to update `package.json` for the `initsql` script to work.

6. Start the server by typing:

  ```bash
  npm start
  ```

7. Visit your website.
    * If you're on your VM you just need to put your VM's IP address into a browser, or if you're developing on a desktop machine it will be http://127.0.0.1:8080 .

Git: A recommendation
----------------------
If at all possible, we recommend you use git to download code rather than zips of a repository.  This is preferable because if the repo is updated, then syncing those changes requires just one command (`git pull`) and usually any merging can be done automatically.  Git is very powerful and we heartily encourages you to become familiar with it.
