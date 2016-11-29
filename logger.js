'use strict';

var http = require('http');

var id = require('./index').id();

var
  path = require.resolve('./index').split('/'),
  topic = path.length > 1 ? path[path.length-2] : undefined;

var
  svr = "rjb.soc.port.ac.uk",
  port = 80,
  now = Date.now(),
  runid = "run " + id + " " + now,
  order = 0,
  tests = [],
  modules = {},

  runRecord = {
    "id": runid,
    "uid": id,
    "topic": topic,
    "time": now,
    "browser": {
      // record details about what kind of dev platform is being used
      // for a run of tests - super useful when bugs can't be reproduced.
      "platform": process.platform,
      "release": process.release,
    },
    "testsSucceeded": [],
    "testsFailed": [],
  };

module.exports.setupLogging = function (QUnit, test) {
  QUnit.log(log);
  QUnit.testDone(testDone);
  QUnit.done(done);

  QUnit.module('basics');

  test(
    'ID in `index.js`',
    function() {
      ok(id != 'UP000000', 'put your ID in `index.js` please');
    }
  );

  QUnit.module(topic || 'undefined');
}

/**
 * This gets called every time a unit test assertion runs (pass or fail)
 */
function log( details ) {
  // ensure whatever this module is is recorded in the list of modules.
  var key = details.module.toLowerCase().replace(/[^a-zA-Z\d]/gi, "_");
  modules[key] = details.module;

  // record test instance details
  details.time = Date.now();
  details.order = order++;
  details.runid = runid;
  details.moduleid = key;

  // record the individual test
  tests.push(details);
}

/**
 * This gets called every time a whole unit test runs (pass or fail)
 */
function testDone( details ) {
  // ensure whatever this module is is recorded in the list of modules.
  var moduleid = details.module.toLowerCase().replace(/[^a-zA-Z\d]/gi, "_");

  var testName = moduleid + '/' + details.name;
  if (testName.length > 70) testName = testName.substring(0, 69) + '…';

  // if a test fails any assertion, it will be recorded as failed
  if (details.failed) {
    runRecord.testsFailed.push(testName);
  } else {
    runRecord.testsSucceeded.push(testName);
  }
}

/**
 * This gets called after the last test has run.
 */
function done( details ) {
  runRecord.summary = details;
  addStudent();
  addModules();
  addRunRecord();
}

function sendData(what, path) {
  var options = {
    host: svr,
    port: port,
    method: 'POST',
    path: path,
  };

  try {
    var req = http.request(options);
    req.setHeader("Accept", "application/json");
    req.setHeader("Content-type", "application/json");
    req.on('error', logError);
    req.end(JSON.stringify(what));
  } catch (e) {
    logError(e);
  }
}

var loggedSendingError = false;

function logError(e) {
  if (!loggedSendingError) {
    console.log('error logging test results: ' + e);
    loggedSendingError = true;
  }
}

function addRunRecord() {
  sendData( runRecord, "/runs/" );
}

function addStudent() {
  sendData( { "id": id }, "/students/" );
}

function addModules() {
  for (var key in modules) {
    if (modules.hasOwnProperty(key)) {
      sendData(
        {
          "id": key,
          "name": modules[key]
        },
        "/modules/"
      );
    }
  }
}
