/* global require:false, module:false */
'use strict';

let _ = require('lodash');

/**
 * @module Freshdesk
 * @class Note
 * @constructor
 * @param {String|Number} [ticketId]
 */
class Note {
	constructor(ticketId) {
		this.TicketId = ticketId;
		this.Private = true;
	}

	get Id() {
		return this.__id;
	}

	set Id(value) {
		if (!value) {
			throw new Error('Invalid note id');
		}

		this.__id = parseFloat(value);
	}

	get TicketId() {
		return this.__ticketId;
	}

	set TicketId(value) {
		if (!value) {
			throw new Error('Invalid note ticketId');
		}

		this.__ticketId = parseFloat(value);
	}

	get Body() {
		return this.__body;
	}

	set Body(value) {
		if (!value) {
			throw new Error('Invalid note body');
		}

		this.__body = value.toString();
	}

	get BodyHtml() {
		return this.__bodyHtml;
	}

	set BodyHtml(value) {
		if (!value) {
			throw new Error('Invalid note bodyhtml');
		}

		this.__bodyHtml = value.toString();
	}

	get Private() {
		return this.__private;
	}

	set Private(value) {
		let valueType = typeof value;

		if (valueType !== 'boolean') {
			throw new Error('Invalid note private state');
		}

		this.__private = value;
	}

	get NotifyEmails() {
		if (!this.__notifyEmails) {
			return [];
		}

		return _.map(this.__notifyEmails, _.clone);
	}

	set NotifyEmails(value) {
		let isArray = Array.isArray(value);

		if (!isArray) {
			throw new Error('Provide array of emails to notify');
		}

		if (value.length === 0) {
			return;
		}

		this.__notifyEmails = value;
	}

	makePrivate() {
		this.Private = true;
	}

	makePublic() {
		this.Private = false;
	}

	notifyByEmail(emailToNotify) {
		let currentEmailsToNotify = this.NotifyEmails;
		currentEmailsToNotify.push(emailToNotify);
		this.NotifyEmails = currentEmailsToNotify;
	}

	toJSON() {
		let self = this;

		return {
			id: self.Id,
			private: self.Private,
			notify_emails: self.NotifyEmails,
			body: self.Body,
			body_html: self.BodyHtml
		};
	}

	isValid() {
		let isTicketIdMissing = !this.TicketId;

		if (isTicketIdMissing) {
			return false;
		}

		let isBodyMissing = !this.Body;
		let isBodyHtmlMissing = !this.BodyHtml;

		if (isBodyMissing && isBodyHtmlMissing) {
			return false;
		}

		return true;
	}
}

module.exports = Note;