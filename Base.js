/* global require:false, module:false */
'use strict';

let _ = require('lodash');

class Base {
	constructor() {
		this.__changes = {};
	}

	get Id() {
		return this.__id;
	}

	set Id(value) {
		let valueType = typeof value;

		if (!value || (valueType !== 'string' && valueType !== 'number')) {
			throw new Error('Invalid id');
		}

		this.__id = parseFloat(value);
	}

	addChange(propertyName, targetPropertyValue) {
		let previousPropertyValue = this[propertyName];

		if (previousPropertyValue !== targetPropertyValue) {
			this.__changes[propertyName] = targetPropertyValue;
		}
	}

	getRemoteChanges() {
		let changesCount = _.keys(this.__changes);

		if (changesCount.length === 0) {
			return null;
		}

		return this.toJSON.bind(this.__changes)();
	}
}

module.exports = Base;