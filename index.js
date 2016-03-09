/* global Buffer */
'use strict';

let _ = require('lodash');
let Q = require('q');
let request = require('superagent');

let Contact = require('./Contact');
let Ticket = require('./Ticket');
let TicketStatus = require('./TicketStatus');
let TicketPriority = require('./TicketPriority');
let Note = require('./Note');
let TicketReply = require('./TicketReply');

const BASE_FRESHDESK_API_URL_BUILDER = (helpdeskName) => `https://${helpdeskName}.freshdesk.com/api/v2`;
const FRESHDESK_TICKETS_URL_BUILDER = (ticketId) => `/tickets/${ticketId ? '/'+ticketId : ''}`;
const FRESHDESK_CONTACTS_URL_BUILDER = (contactId) => `/contacts${contactId ? '/'+contactId : ''}`;
const FRESHDESK_TICKET_FIELDS_URL_BUILDER = (ticketFieldType) => `/ticket_fields${ticketFieldType ? '/'+ticketFieldType : ''}`;
const FRESHDESK_ADD_NOTES_URL_BUILDER = (ticketId) => `/tickets/${ticketId}/notes`;
const FRESHDESK_ADD_TICKET_REPLY_URL_BUILDER = (ticketId) => `/tickets/${ticketId}/reply`;

const TICKET_STATUS_FIELD_NAME = 'status';
const TICKET_PRIORITY_FIELD_NAME = 'priority';

function requestToPromise(request) {
    let deferred = Q.defer();

    request.end((err, res) => {
        if (err) {
            //Freshdesk API unexpected behaviour to return ' ' on 404
            //and superagent returning no response status on json parse error
            if (typeof err.rawResponse === 'string' && err.rawResponse.trim() === '') {
                return deferred.resolve(null);
            }

            if (err.status !== 404) {
                return deferred.reject(err);
            }
        }

        deferred.resolve(res);
    });

    return deferred.promise;
}

function transformPromiseResult(promise, transformAction) {
    let deferred = Q.defer();

    promise.then(function(result) {
        let transformedResult = transformAction(result);
        deferred.resolve(transformedResult);
    }, deferred.reject);

    return deferred.promise;
}

/**
 * @module Freshdesk
 * @class Freshdesk
 * @constructor
 * @param {String} [helpdeskName] The helpdesk name. Ex: In "https://sometopsecretcompany.freshdesk.com" sometopsecretcompany is the helpdesk name
 * @param {String} [apiKey]
 */
class Freshdesk {
    constructor(helpdeskName, apiKey) {
        this.__HelpdeskName = helpdeskName;
        this.__ApiKey = apiKey;
    }

    set __HelpdeskName(value) {
        if (!value) {
            throw new Error('Freshdesk api not configured. Helpdesk name not provided!');
        }

        this.__helpdeskName = value;
    }

    get __HelpdeskName() {
        if (!this.__helpdeskName) {
            throw new Error('Freshdesk api not configured. Helpdesk name not provided!');
        }

        return this.__helpdeskName;
    }

    set __ApiKey(value) {
        if (!value) {
            throw new Error('Freshdesk api key not provided on initialization!');
        }

        this.__apiKey = value;
    }

    get __ApiKey() {
        if (!this.__apiKey) {
            throw new Error('Freshdesk api key not provided on initialization!');
        }

        return this.__apiKey;
    }

    set __TicketFields(value) {
        this.__ticketFields = value;
    }

    get __TicketFields() {
        return this.__ticketFields;
    }

    get __AuthToken() {
        if (!this.__authToken) {
            this.__authToken = 'Basic ' + new Buffer(this.__ApiKey + ':X').toString('base64');
        }

        return this.__authToken;
    }

    get __BaseUrl() {
        if (!this.__baseUrl) {
            this.__baseUrl = BASE_FRESHDESK_API_URL_BUILDER(this.__HelpdeskName);
        }

        return this.__baseUrl;
    }

    /**
     * @method findContacts
     * @param {Object} [queryObj={}] Gets all of the contacts matching the filter criteria.
     * <a href="http://developer.freshdesk.com/api/#list_all_contacts">More about query properties</a>
     **/
    findContacts(queryObj) {
        queryObj = queryObj || {};

        let resourceUrl = this.__BaseUrl + FRESHDESK_CONTACTS_URL_BUILDER(queryObj.id);
        let requestObj = request.get(resourceUrl)
            .set('Authorization', this.__AuthToken)
            .set('Accept', 'application/json')
            .query(queryObj);
        let requestPromise = requestToPromise(requestObj)

        //Return the results not the response
        //And check in case of no values
        return transformPromiseResult(requestPromise, (response) => (response || {}).body);
    }

    findContactByEmail(email) {
        if (!email) {
            throw new Error('No contact email provided');
        }

        let requestPromise = this.findContacts({
            email: email
        });

        //Transform from array of single element to single object return of the promise
        return transformPromiseResult(requestPromise, (results) => _.head(results));
    }

    findContactById(contactId) {
        if (!contactId) {
            throw new Error('No contact id provided');
        }

        let requestPromise = this.findContacts({
            id: contactId
        });

        return requestPromise;
    }

    findTicketById(ticketId) {
        if (!ticketId) {
            throw new Error('No ticket id provided');
        }

        let resourceUrl = this.__BaseUrl + FRESHDESK_TICKETS_URL_BUILDER(ticketId);
        let requestObj = request.get(resourceUrl)
            .set('Authorization', this.__AuthToken)
            .set('Accept', 'application/json');
        let requestPromise = requestToPromise(requestObj);

        //Return the results not the response
        //And check in case of no values
        return transformPromiseResult(requestPromise, (response) => Ticket.fromJSON((response || {}).body));
    }

    createContact(contact) {
        if (!contact) {
            throw new Error('Cant create contact without providing contact information');
        }

        if (!contact.isValid || typeof contact.isValid !== 'function' || !contact.isValid()) {
            throw new Error('Invalid freshdesk contact');
        }

        let resourceUrl = this.__BaseUrl + FRESHDESK_CONTACTS_URL_BUILDER();
        let requestObj = request.post(resourceUrl)
            .send(contact)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', this.__AuthToken);

        return requestToPromise(requestObj);
    }

    //Returns the ticket on sucessful creation
    createTicket(ticket) {
        if (!ticket) {
            throw new Error('Cant create ticket without providing ticket information');
        }

        if (!ticket.isValid || typeof ticket.isValid !== 'function' || !ticket.isValid()) {
            throw new Error('Invalid freshdesk ticket');
        }

        let resourceUrl = this.__BaseUrl + FRESHDESK_TICKETS_URL_BUILDER();
        let requestObj = request.post(resourceUrl)
            .send(ticket)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', this.__AuthToken);
        let requestPromise = requestToPromise(requestObj);

        return transformPromiseResult(requestPromise, (response) => Ticket.fromJSON((response || {}).body));
    }

    updateTicket(ticket) {
        if (!ticket) {
            throw new Error('Cant update ticket without providing ticket information');
        }

        if (!ticket.isValid || typeof ticket.isValid !== 'function' || !ticket.isValid()) {
            throw new Error('Invalid freshdesk ticket');
        }

        //Skip if no changes are made to the ticket
        let ticketChanges = ticket.getRemoteChanges();
        if (!ticketChanges) {
            return Q(ticket);
        }

        let resourceUrl = this.__BaseUrl + FRESHDESK_TICKETS_URL_BUILDER(ticket.Id);
        let requestObj = request.put(resourceUrl)
            .send(ticketChanges)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', this.__AuthToken);
        let requestPromise = requestToPromise(requestObj);

        return transformPromiseResult(requestPromise, (response) => Ticket.fromJSON((response || {}).body));
    }

    replyToTicket(ticketReply) {
        if (!ticketReply) {
            throw new Error('Cant create reply to a ticket without providing reply information');
        }

        if (!ticketReply.isValid || typeof ticketReply.isValid !== 'function' || !ticketReply.isValid()) {
            throw new Error('Invalid ticketReply');
        }

        let resourceUrl = this.__BaseUrl + FRESHDESK_ADD_TICKET_REPLY_URL_BUILDER(ticketReply.TicketId);
        let requestObj = request.post(resourceUrl)
            .send(ticketReply)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', this.__AuthToken);

        let requestPromise = requestToPromise(requestObj);
        return transformPromiseResult(requestPromise, (response) => (response || {}).body);
    }

    //Returns ' ' on successful storing - possibly something temporary
    createNote(note) {
        if (!note) {
            throw new Error('Cant create note without providing note information');
        }

        if (!note.isValid || typeof note.isValid !== 'function' || !note.isValid()) {
            throw new Error('Invalid freshdesk note');
        }

        let resourceUrl = this.__BaseUrl + FRESHDESK_ADD_NOTES_URL_BUILDER(note.TicketId);
        let requestObj = request.post(resourceUrl)
            .send(note)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', this.__AuthToken);

        let requestPromise = requestToPromise(requestObj);
        return transformPromiseResult(requestPromise, (response) => (response || {}).body);
    }

    findTicketFields(fieldType) {
        let self = this;
        let resourceUrl = this.__BaseUrl + FRESHDESK_TICKET_FIELDS_URL_BUILDER(fieldType);
        let requestObj = request.get(resourceUrl)
            .set('Authorization', this.__AuthToken)
            .set('Accept', 'application/json');
        let requestPromise = requestToPromise(requestObj);

        //Return the results not the response
        //And check in case of no values
        return transformPromiseResult(requestPromise, (response) => {
            let responseBody = (response || {}).body;
            self.__TicketFields = responseBody;

            return responseBody;
        });
    }

    findTicketStatuses() {
        let self = this;
        let deferred = Q.defer();

        process.nextTick(() => {
            let fieldsRetrievalRequest;

            if (!self.__TicketFields) {
                fieldsRetrievalRequest = self.findTicketFields();
            } else {
                fieldsRetrievalRequest = Q.defer();
                fieldsRetrievalRequest.resolve();
                fieldsRetrievalRequest = fieldsRetrievalRequest.promise;
            }

            fieldsRetrievalRequest.then(() => {
                let statusObject = _.find(self.__TicketFields, (field) => field.name === TICKET_STATUS_FIELD_NAME);
                let parsedStatuses = TicketStatus.Parse(statusObject);
                deferred.resolve(parsedStatuses);
            }, deferred.reject);
        });

        return deferred.promise;
    }

    findTicketPriorities() {
        let self = this;
        let deferred = Q.defer();

        process.nextTick(() => {
            let fieldsRetrievalRequest;

            if (!self.__TicketFields) {
                fieldsRetrievalRequest = self.findTicketFields();
            } else {
                fieldsRetrievalRequest = Q.defer();
                fieldsRetrievalRequest.resolve();
                fieldsRetrievalRequest = fieldsRetrievalRequest.promise;
            }

            fieldsRetrievalRequest.then(() => {
                let statusObject = _.find(self.__TicketFields, (field) => field.name === TICKET_PRIORITY_FIELD_NAME);
                let parsedStatuses = TicketPriority.Parse(statusObject);
                deferred.resolve(parsedStatuses);
            }, deferred.reject);
        });

        return deferred.promise;
    }
}

Freshdesk.Objects = {
    Contact: Contact,
    Ticket: Ticket,
    Note: Note,
    TicketReply: TicketReply
};

module.exports = Freshdesk;