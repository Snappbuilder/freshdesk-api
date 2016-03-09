/* global require:false, module:false */
'use strict';

let Contact = require('./Contact');
let constants = require('./constants');
let TicketStatusConstants = constants.Status;
let TicketStatusFromFreshdeskConstants = constants.StatusFromFreshdesk;

let _ = require('lodash');

class TicketStatus {
	get Open() {
		if (!this.__open) {
			throw new Error('Status not set. Possibly deleted on the Freshdesk');
		}

		return this.__open;
	}

	set Open(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid open status');
		}

		this.__open = parseFloat(value);
	}

	get Pending() {
		if (!this.__pending) {
			throw new Error('Status not set. Possibly deleted on the Freshdesk');
		}

		return this.__pending;
	}

	set Pending(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid pending status');
		}

		this.__pending = parseFloat(value);
	}

	get Resolved() {
		if (!this.__resolved) {
			throw new Error('Status not set. Possibly deleted on the Freshdesk');
		}

		return this.__resolved;
	}

	set Resolved(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid resolved status');
		}

		this.__resolved = parseFloat(value);
	}

	get Closed() {
		if (!this.__closed) {
			throw new Error('Status not set. Possibly deleted on the Freshdesk');
		}

		return this.__closed;
	}

	set Closed(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid closed status');
		}

		this.__closed = parseFloat(value);
	}

	get Approved() {
		if (!this.__approved) {
			throw new Error('Status not set. Possibly deleted on the Freshdesk');
		}

		return this.__approved;
	}

	set Approved(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid approved status');
		}

		this.__approved = parseFloat(value);
	}

	get Rejected() {
		if (!this.__rejected) {
			throw new Error('Status not set. Possibly deleted on the Freshdesk');
		}

		return this.__rejected;
	}

	set Rejected(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid rejected status');
		}

		this.__rejected = parseFloat(value);
	}

	static Parse(unparsedStatus) {
		let choices = unparsedStatus.choices;
		let ticketStatusInstance = new TicketStatus();

		_.forOwn(choices, function(value, key) {
			_.forOwn(TicketStatusFromFreshdeskConstants, function(fdStatusValue, fdStatusKey) {
				let contains = _.some(value, (v) => v === fdStatusKey);

				if (contains) {
					ticketStatusInstance[fdStatusValue] = key;
				}
			});
		});

		return ticketStatusInstance;
	}
}

module.exports = TicketStatus;