/* global require:false, module:false */
'use strict';

/**
 * @module Freshdesk
 * @class Contact
 * @constructor
 * @param {String} [name] The name of the contact
 */
class Contact {
	constructor(name) {
		this.Name = name;
	}

	get Id() {
		return this.__id;
	}

	set Id(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid contact id');
		}

		this.__id = parseFloat(value);
	}

	get Name() {
		return this.__name;
	}

	set Name(value) {
		if (!value || typeof value !== 'string') {
			throw new Error('Invalid contact name');
		}

		this.__name = value;
	}

	get Email() {
		return this.__email;
	}

	set Email(value) {
		if (!value || typeof value !== 'string') {
			throw new Error('Invalid contact Email');
		}

		this.__email = value;
	}

	get Phone() {
		return this.__phone;
	}

	set Phone(value) {
		if (!value || typeof value !== 'string') {
			throw new Error('Invalid contact Phone');
		}

		this.__phone = value;
	}

	get TwitterId() {
		return this.__twitterId;
	}

	set TwitterId(value) {
		if (!value || typeof value !== 'string') {
			throw new Error('Invalid contact TwitterId');
		}

		this.__twitterId = value;
	}

	toJSON() {
		let self = this;

		return {
			id: self.Id,
			name: self.Name,
			phone: self.Phone,
			email: self.Email,
			mobile: self.Mobile,
			twitter_id: self.TwitterId
		};
	}

	isValid() {
		let isNameMissing = !this.Name;

		if (isNameMissing) {
			return false;
		}

		let isEmailMissing = !this.Email;
		let isPhoneMissing = !this.Phone;
		let isTwitterIdMissing = !this.TwitterId;

		if (isEmailMissing && isPhoneMissing && isTwitterIdMissing) {
			return false;
		}

		return true;
	}
}

module.exports = Contact;