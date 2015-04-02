/** @flow */
/* global gapi */

var ActionType = require('../constants/ActionType');
var API = require('../api/API');
var Dispatcher = require('../Dispatcher');
var MessageTranslator = require('../utils/MessageTranslator');
var RSVP = require('rsvp');
var _ = require('lodash');

import type {TMessage} from '../constants/Types';
type Message = typeof TMessage;

function getByIDs(
  options: {ids: Array<string>}
): Promise<Array<Message>> {
  return API.wrap(() => {
    var batch = gapi.client.newHttpBatch();
    options.ids.forEach(id => {
      batch.add(
        gapi.client.gmail.users.messages.get({userId: 'me', id}),
        {id}
      );
    });
    return API.execute(batch).then(
      response => options.ids.map(messageID => response[messageID].result)
    );
  });
}

module.exports = {
  getByIDs,
};
