/* global require:false, module:false */
'use strict';

let _ = require('lodash');

const TICKET_STATUSES = {
	Open: 'Open',
	Pending: 'Pending',
	Resolved: 'Resolved',
	Closed: 'Closed',
  Approved: 'Approved',
  Rejected: 'Rejected'
};

const REVERSED_TICKET_STATUSES = _.invert(TICKET_STATUSES);

module.exports = {
	Status: TICKET_STATUSES,
	StatusFromFreshdesk: REVERSED_TICKET_STATUSES
};