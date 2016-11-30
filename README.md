ws_api
======

A simple example of an API-based web app.


Running Tests
-------------

We continue to use QUnit to define tests that you should attempt to complete.  
The difference now is that there is no browser – you must install the source
code and the test framework and then run the tests from the command line:

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

2. To download the QUnit files (and any libraries it uses, which you need to do before the first run of tests, but just the once) type:

  ```bash
  npm install
  ```

3. Run the tests by typing:

  ```bash
  npm test
  ```

4. Inside `test.js` you will find helpful comments that tell you what the tests expect.


Example: JStagram
-----------------

To get the example running...

1. Install and run MySQL.
    * If you're using your VM for this, MySQL is already installed and running.

2. Edit `examples/sql_config.json` so that your database `host`, `user` and `password` properties are correct.
    * The defaults should work on your VM.

3. Install the database and tables using: `npm run initsql`.

4. Start the server using `npm start`.

5. Visit your website.
    * If you're developing on a desktop machine it will be http://127.0.0.1:8080 or if you're on your VM you just need to put your VM's IP address into a browser.

Git: A recommendation
----------------------
If at all possible, we recommend you use git to download code rather than zips of a repository.  This is preferable because if the repo is updated, then syncing those changes requires just one command (`git pull`) and usually any merging can be done automatically.  Git is very powerful and we heartily encourages you to become familiar with it.
