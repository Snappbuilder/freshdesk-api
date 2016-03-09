/* global require:false, module:false */
'use strict';

let Contact = require('./Contact');

let _ = require('lodash');

class TicketPriority {
	get Low() {
		if (!this.__low) {
			throw new Error('Priority not set. Possibly deleted on the Freshdesk');
		}

		return this.__low;
	}

	set Low(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid priority');
		}

		this.__low = parseFloat(value);
	}

	get Medium() {
		if (!this.__medium) {
			throw new Error('Priority not set. Possibly deleted on the Freshdesk');
		}

		return this.__medium;
	}

	set Medium(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid priority');
		}

		this.__medium = parseFloat(value);
	}

	get High() {
		if (!this.__high) {
			throw new Error('Priority not set. Possibly deleted on the Freshdesk');
		}

		return this.__high;
	}

	set High(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid priority');
		}

		this.__high = parseFloat(value);
	}

	get Urgent() {
		if (!this.__urgent) {
			throw new Error('Priority not set. Possibly deleted on the Freshdesk');
		}

		return this.__urgent;
	}

	set Urgent(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid priority');
		}

		this.__urgent = parseFloat(value);
	}

	static Parse(unparsedStatus) {
		let choices = unparsedStatus.choices;
		let ticketStatusInstance = new TicketPriority();

		_.forOwn(choices, function(value, key) {
			if (key in ticketStatusInstance) {
				ticketStatusInstance[key] = value;
			}
		});

		return ticketStatusInstance;
	}
}

module.exports = TicketPriority;