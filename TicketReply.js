/* global require:false, module:false */
'use strict';

class TicketReply {
	constructor(ticketId) {
		this.TicketId = ticketId;
	}

	get Id() {
		return this.__id;
	}

	set Id(value) {
		if (!value) {
			throw new Error('Invalid TicketReply id');
		}

		this.__id = parseFloat(value);
	}

	get TicketId() {
		return this.__ticketId;
	}

	set TicketId(value) {
		if (!value) {
			throw new Error('Invalid TicketReply ticketId');
		}

		this.__ticketId = parseFloat(value);
	}

	set Ticket(value) {
		if (!value) {
			throw new Error('Invalid TicketReply ticketId');
		}

		this.TicketId = value.Id;
	}

	get Body() {
		return this.__body;
	}

	set Body(value) {
		if (!value) {
			throw new Error('Invalid TicketReply body');
		}

		this.__body = value.toString();
	}

	get BodyHtml() {
		return this.__bodyHtml;
	}

	set BodyHtml(value) {
		if (!value) {
			throw new Error('Invalid TicketReply bodyhtml');
		}

		this.__bodyHtml = value.toString();
	}

	toJSON() {
		let self = this;

		return {
			id: self.Id,
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

module.exports = TicketReply;