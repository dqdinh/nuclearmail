/** @flow */
/* global gapi */

var ClientID = require('../utils/ClientID');
var EventEmitter = require('events').EventEmitter;
var RSVP = require('rsvp');

var emitter = new EventEmitter();
var isAvailable = false;
var pendingRequests = [];

// https://github.com/tildeio/rsvp.js/#error-handling
RSVP.on('error', function(error) {
  console.error(error, error.stack);
});

// Alternative: call tryAuthorize when App
// component is mounted.
window.handleGoogleClientLoad = function() {
  tryAuthorize(true);
};

function tryAuthorize(immediate: boolean) {
  var config = {
    /*eslint-disable camelcase*/
    client_id: '108971935462-ied7vg89qivj0bsso4imp6imhvpuso5u.apps.googleusercontent.com',
    /*eslint-enable*/
    scope: 'email https://www.googleapis.com/auth/gmail.modify',
    immediate
  };
  gapi.auth.authorize(config, whenAuthenticated);
}

function whenAuthenticated(authResult) {
  if (authResult && !authResult.error) {
    emitter.emit('isAuthorized', true);
    gapi.client.load('gmail', 'v1', whenLoaded);
  } else {
    emitter.emit('isAuthorized', false);
 }
}

function whenLoaded() {
  isAvailable = true;
  if (pendingRequests.length) {
    pendingRequests.forEach(request => request());
  }
  pendingRequests = [];
}

function promiseGoogleApiAvailable() {
  if (isAvailable) {
    return RSVP.Promise.resolve();
  }

  return new RSVP.Promise((resolve) => {
    pendingRequests.push(resolve);
  });
}

var inProgressAPICalls = {};

/**
 * Wraps a function with API in-progress reporting and error logging.
 */
function wrap(getPromise: () => Promise): Promise {
  var id = ClientID.get();
  inProgressAPICalls[id] = true;
  // sets App state 'isLoading' to true
  emitter.emit('start', id);

  var promise = promiseGoogleApiAvailable().then(() => {
    return getPromise();
  });

  promise.catch(error => console.log('API Error', error));

  return promise.finally(() => {
    delete inProgressAPICalls[id];
    // Nothing listens for 'stop'
    // emitter.emit('stop', id);
    if (!Object.keys(inProgressAPICalls).length) {
    // sets App state 'isLoading' to false
      emitter.emit('allStopped');
    }
  });
}

function isInProgress(): boolean {
  return !!Object.keys(inProgressAPICalls).length;
}

function subscribe(
  eventName: string,
  callback: (value: ?boolean) => void
): {remove: () => void;} {
  emitter.on(eventName, callback);
  return {
    remove() {
      emitter.removeListener(eventName, callback);
    }
  };
}

/**
 * Executes a Google API request (anything with an execute method), turning
 * it into a promise. The promise is rejected if the response contains an
 * error field, resolved otherwise.
 */
function execute(request: GoogleAPIExecutable) {
  return new RSVP.Promise((resolve, reject) => {
    request.execute(response => {
      if (response.error) {
        console.error('API Error', response.error);
        reject(response.error);
        return;
      }

      resolve(response);
    });
  });
}

module.exports = {
  execute,
  isInProgress,
  login: tryAuthorize.bind(null, /*immediate*/ false),
  subscribe,
  wrap,
};
