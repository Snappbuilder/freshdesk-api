/* global require:false, module:false */
'use strict';

let _ = require('lodash');

let Base = require('./Base');
let Contact = require('./Contact');

/**
 * @module Freshdesk
 * @class Ticket
 * @constructor
 * @param {String} [subject]
 * @param {Number} [status] Check findTicketStatuses()
 * @param {Number} [priority] Check findTicketPriorities()
 */
class Ticket extends Base {
	constructor(subject, status, priority) {
		super();
		this.Subject = subject;
		this.Status = status;
		this.Priority = priority;
		this.__changes = {};
	}

	get Description() {
		return this.__description;
	}

	set Description(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid ticket description');
		}

		let normalizedValue = value.toString();
		this.addChange('Description', normalizedValue);
		this.__description = normalizedValue;
	}

	get DescriptionHtml() {
		return this.__descriptionHtml;
	}

	set DescriptionHtml(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid ticket DescriptionHtml');
		}

		let normalizedValue = value.toString();
		this.addChange('DescriptionHtml', normalizedValue);
		this.__descriptionHtml = normalizedValue;
	}

	get Subject() {
		return this.__subject;
	}

	set Subject(value) {
		let valueType = typeof value;

		if (!value) {
			throw new Error('Invalid ticket subject');
		}

		let normalizedValue = value.toString();
		this.addChange('Subject', normalizedValue);
		this.__subject = normalizedValue;
	}

	get Status() {
		return this.__status;
	}

	set Status(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid ticket Status');
		}

		let normalizedValue = parseFloat(value);
		this.addChange('Status', normalizedValue);
		this.__status = normalizedValue;
	}

	get Priority() {
		return this.__priority;
	}

	set Priority(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid ticket Priority');
		}

		let normalizedValue = parseFloat(value);
		this.addChange('Priority', normalizedValue);
		this.__priority = normalizedValue;
	}

	get RequesterId() {
		return this.__requesterId;
	}

	set RequesterId(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid ticket RequesterId');
		}

		let normalizedValue = parseFloat(value);
		this.addChange('RequesterId', normalizedValue);
		this.__requesterId = normalizedValue;
	}

	get Requester() {
		return this.__requester;
	}

	set Requester(value) {
		let valueType = typeof value;

		if (!value || !(value instanceof Contact)) {
			throw new Error('Invalid ticket requester');
		}

		if (!!value.Id) {
			this.RequesterId = value.Id;
		}

		this.__requester = value;
	}
  
  get CustomFields() {
		return this.__customFields;
	}

	set CustomFields(obj) {
    if (!this.__customFields) {
      this.__customFields = {};
    }
    this.addChange('CustomFields', obj);
		this.__customFields = obj;
	}

	// changeStatus(targetStatus) {
	// 	let previousStatus = this.Status
	// 	this.Status = targetStatus;

	// 	if (previousStatus !== targetStatus) {
	// 		this.__changes.Status = targetStatus;
	// 	}
	// }

	// getRemoteChanges() {
	// 	let changesCount = _.keys(this.__changes);

	// 	if (changesCount.length === 0) {
	// 		return null;
	// 	}

	// 	return this.toJSON.bind(this.__changes)();
	// }

	isValid() {
		let isDescriptionMissing = !this.Description;
		let isDescriptionHtmlMissing = !this.DescriptionHtml;

		if (isDescriptionMissing && isDescriptionHtmlMissing) {
			return false;
		}

		let isRequesterIdMissing = !this.RequesterId;

		if (isRequesterIdMissing) {
			return false;
		}

		return true;
	}

	toJSON() {
		let self = this;
		let json = {};

		if (self.Id) {
			json.id = self.Id;
		}

		if (self.RequesterId) {
			json.requester_id = self.RequesterId;
		}

		if (self.Subject) {
			json.subject = self.Subject;
		}

		if (self.Status) {
			json.status = self.Status;
		}

		if (self.Priority) {
			json.priority = self.Priority;
		}

		if (self.Description) {
			json.description = self.Description;
		}

		if (self.DescriptionHtml) {
			json.description_html = self.DescriptionHtml;
		}
    
		if (self.CustomFields) {
			json.custom_fields = self.CustomFields;
		}

		return json;
	}

	static fromJSON(raw) {
		if (!raw) {
			return null;
		}

		let transformedTicket = new Ticket(raw.subject, raw.status, raw.priority);

		if (!!raw.description) {
			transformedTicket.Description = raw.description;
		}

		if (!!raw.description_html) {
			transformedTicket.DescriptionHtml = raw.description_html;
		}

		if (!!raw.requester_id) {
			transformedTicket.RequesterId = raw.requester_id;
		}

		if (!!raw.id) {
			transformedTicket.Id = raw.id;
		}

		if (!!raw.custom_fields) {
			transformedTicket.CustomFields = raw.custom_fields;
		}

		return transformedTicket;
	}
}

module.exports = Ticket;