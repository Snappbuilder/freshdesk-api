'use strict';

const Q = require('q');
const expect = require('chai').expect;
const request = require('superagent');

const Freshdesk = require('./');

const testConfig = require('../../cfg/test');
const FRESHDESK_NAME = testConfig.freshdesk.name;
const FRESHDESK_API_KEY = testConfig.freshdesk.apiKey;

//TODO: replace with generators and extract repeating initializations
describe('Freshdesk class', () => {
    const Contact = require('../../src/services/freshdesk').Objects.Contact;
    const Ticket = require('../../src/services/freshdesk').Objects.Ticket;
    const Note = require('../../src/services/freshdesk').Objects.Note;
    const TicketReply = require('../../src/services/freshdesk').Objects.TicketReply;

    const RANDOM_INVALID_TICKET_ID = 9999999;

    it('should be a function', () => {
        return expect(Freshdesk).to.be.function
    });

    it('should contain the Freshdesk entity objects', () => {
        return expect(Freshdesk).to.have.property('Objects');
    });

    it('should contain the Freshdesk Contact object', () => {
        return expect(Freshdesk.Objects).to.have.property('Contact');
    });

    describe('#constructor', () => {
        it('should fail with missing freshdesk name and api key', () => {
            return expect(() => {
                let freshdeskInstance = new Freshdesk();
            }).to.throw(Error);
        });

        it('should fail with missing freshdesk name', () => {
            return expect(() => {
                let freshdeskInstance = new Freshdesk(null, '');
            }).to.throw(Error);
        });

        it('should fail with missing api key', () => {
            return expect(() => {
                let freshdeskInstance = new Freshdesk(FRESHDESK_NAME, null);
            }).to.throw(Error);
        });
    });

    describe('#createContact', () => {
        let freshdeshInstance;
        let validContactWithEmail;

        before(function() {
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
        });

        beforeEach(function() {
            validContactWithEmail = new Contact('John Doe');
            validContactWithEmail.Email = 'john@test.cc';
        });

        it('should fail with missing contact information', () => {
            return expect(() => {
                freshdeshInstance.createContact();
            }).to.throw(Error);
        });

        it('should fail with invalid contact information', () => {
            return expect(() => {
                freshdeshInstance.createContact({});
            }).to.throw(Error);
        });

        it('should fail with contact containing only name', () => {
            return expect(() => {
                let invalidContact = new Contact('Invalid Contact');
                freshdeshInstance.createContact(invalidContact);
            }).to.throw(Error);
        });

        //TODO: Find a way to avoid the api conflicts so the test will work in all cases
        // it('should succeed with contact containing name and email', (done) => {
        //     let createdContact = freshdeshInstance.createContact(validContactWithEmail);
        //     return expect(createdContact).to.eventually.be.fulfilled.and.notify(done);
        // });

    });

    describe('#findContactByEmail', () => {
        let freshdeshInstance;
        let validContactWithEmail;

        before(function() {
            this.timeout(10000);

            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
            validContactWithEmail = new Contact('John Doe');
            validContactWithEmail.Email = 'john@test.cc';

            let initialization = Q.defer();

            let isContactExistingRequest = freshdeshInstance.findContactByEmail(validContactWithEmail.Email);
            isContactExistingRequest
                .then((contact) => {
                    if (contact) {
                        return Promise.resolve();
                    }

                    let createContactRequest = freshdeshInstance.createContact(validContactWithEmail);
                    return createContactRequest;
                })
                .done(() => {
                    initialization.resolve();
                });

            return initialization.promise;
        });

        it('should fail with missing contact information', function(done) {
            this.timeout(10000);
            let contactSearchRequest = freshdeshInstance.findContactByEmail(validContactWithEmail.Email);

            return expect(contactSearchRequest).to.eventually.be.fulfilled.and.notify(done);
        });

    });

    describe('#findTicketById', () => {
        let freshdeshInstance;

        before(function() {
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
        });

        it('should fail with missing ticket id', () => {
            return expect(() => {
                freshdeshInstance.findTicketById();
            }).to.throw(Error);
        });

        it('should return empty result with not existing ticket id in freshdesk', function(done) {
            this.timeout(10000);
            let invalidTicket = freshdeshInstance.findTicketById(RANDOM_INVALID_TICKET_ID);

            return expect(invalidTicket).to.eventually.be.fulfilled.and.notify(done);
        });
    });

    describe('#findTicketFields', () => {
        let freshdeshInstance;

        before(function() {
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
        });

        it('should return array', function(done) {
            this.timeout(10000);
            let ticketFieldsRequest = freshdeshInstance.findTicketFields();

            return expect(ticketFieldsRequest).to.eventually.be.fulfilled.and.notify(done);
        });

        it('should cache the retrieved response from the server', function(done) {
            this.timeout(10000);
            let ticketFieldsRequest = freshdeshInstance.findTicketFields();

            ticketFieldsRequest.then(() => {
                expect(freshdeshInstance.__TicketFields).to.exist;
                done();
            });

            return ticketFieldsRequest;
        });
    });

    describe('#findTicketStatuses', () => {
        let freshdeshInstance;

        beforeEach(function() {
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
        });

        it('should return object with the statuses', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

            expect(ticketStatusesRequest).to.eventually.be.fulfilled.and.notify(done);
        });

        it('should have Open status on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__open).to.exist;
                    done();
                });
        });

        it('should have Pending status on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__pending).to.exist;
                    done();
                });
        });

        it('should have Resolved status on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__resolved).to.exist;
                    done();
                });
        });

        it('should have Closed status on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__closed).to.exist;
                    done();
                });
        });

        //Deprecated as a default optional status
        // it('should have WaitingCustomer status on the server', function(done) {
        //     this.timeout(10000);
        //     let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

        //     expect(ticketStatusesRequest)
        //         .to.be.fulfilled
        //         .then(function(obj) {
        //             expect(obj.__waitingCustomer).to.exist;
        //             done();
        //         });
        // });
        //
        //Deprecated as a default optional status
        // it('should have WaitingThirdParty status on the server', function(done) {
        //     this.timeout(10000);
        //     let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();

        //     expect(ticketStatusesRequest)
        //         .to.be.fulfilled
        //         .then(function(obj) {
        //             expect(obj.__waitingThirdParty).to.exist;
        //             done();
        //         });
        // });
    });

    describe('#findTicketPriorities', () => {
        let freshdeshInstance;

        beforeEach(function() {
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
        });

        it('should return object with the priorities', function(done) {
            this.timeout(10000);
            let ticketPrioritiesRequest = freshdeshInstance.findTicketPriorities();

            expect(ticketPrioritiesRequest).to.eventually.be.fulfilled.and.notify(done);
        });

        it('should have Low Priorities on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketPriorities();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__low).to.exist;
                    done();
                });
        });

        it('should have Medium Priorities on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketPriorities();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__medium).to.exist;
                    done();
                });
        });

        it('should have High Priorities on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketPriorities();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__high).to.exist;
                    done();
                });
        });

        it('should have Urgent Priorities on the server', function(done) {
            this.timeout(10000);
            let ticketStatusesRequest = freshdeshInstance.findTicketPriorities();

            expect(ticketStatusesRequest)
                .to.be.fulfilled
                .then(function(obj) {
                    expect(obj.__urgent).to.exist;
                    done();
                });
        });
    });

    describe('#createTicket', () => {
        let freshdeshInstance;
        let validContactWithEmail;
        let ticketPriorities;
        let ticketStatuses;

        before(function() {
            this.timeout(10000);
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);
            validContactWithEmail = new Contact('John Doe');
            validContactWithEmail.Email = 'john@test.cc';
            let contactSearchRequest = freshdeshInstance.findContactByEmail(validContactWithEmail.Email);

            contactSearchRequest.then((contact) => {
                validContactWithEmail.Id = contact.id;
            });

            let ticketStatusRequest = freshdeshInstance.findTicketStatuses();
            ticketStatusRequest.then((statuses) => {
                ticketStatuses = statuses;
            });

            let ticketPrioritiesRequest = freshdeshInstance.findTicketPriorities();
            ticketPrioritiesRequest.then((priorities) => {
                ticketPriorities = priorities;
            });

            return Q.all([
                contactSearchRequest,
                ticketStatusRequest,
                ticketPrioritiesRequest
            ]);
        });

        describe('with requester', () => {

            it('should succeed with valid description, descriptionHtml and Requester', function(done) {
                this.timeout(10000);
                let ticketToAdd = new Ticket('Some description', '<h1>The html description</h1>', 'Ticket subject', ticketStatuses.Open, ticketPriorities.High);
                ticketToAdd.Requester = validContactWithEmail;
                let createdTicket = freshdeshInstance.createTicket(ticketToAdd);
                return expect(createdTicket).to.eventually.be.fulfilled.and.notify(done);
            });

        });

    });

    describe('#updateTicket', () => {
        let freshdeshInstance;
        let validTicket;
        let ticketStatuses;
        let ticketPriorities;

        before(function() {
            this.timeout(10000);
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);

            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();
            let ticketPrioritiesRequest = freshdeshInstance.findTicketPriorities();

            ticketStatusesRequest.then((statuses) => {
                ticketStatuses = statuses;
            });
            ticketPrioritiesRequest.then((priorities) => {
                ticketPriorities = priorities;
            });

            return Q.all([
                ticketStatusesRequest,
                ticketPrioritiesRequest
            ]);
        });

        beforeEach(function() {
            this.timeout(10000);
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);

            let validContactWithEmail = new Contact('John Doe');
            validContactWithEmail.Email = 'john@test.cc';

            let contactSearchRequest = freshdeshInstance.findContactByEmail(validContactWithEmail.Email);

            return Q.spread([contactSearchRequest], function(retrievedContact) {
                validContactWithEmail.Id = retrievedContact.id;

                let ticketToAdd = new Ticket('Some description', '<h1>The html description</h1>', 'Ticket subject', ticketStatuses.Open, ticketPriorities.High);
                ticketToAdd.Requester = validContactWithEmail;
                let createTicketRequest = freshdeshInstance.createTicket(ticketToAdd);

                createTicketRequest.then((ticket) => {
                    validTicket = ticket;
                });

                return createTicketRequest;
            });
        });

        it('should succeed to update the ticket status from open to closed', function(done) {
            this.timeout(10000);

            validTicket.Status = ticketStatuses.Closed;
            let updateTicketRequest = freshdeshInstance.updateTicket(validTicket);

            return expect(updateTicketRequest).to.eventually.be.fulfilled.and.notify(done);
        });

        it('should succeed to update the ticket priority from High to Low', function(done) {
            this.timeout(10000);

            validTicket.Priority = ticketPriorities.Low;
            let updateTicketRequest = freshdeshInstance.updateTicket(validTicket);

            return expect(updateTicketRequest).to.eventually.be.fulfilled.and.notify(done);
        });

    });

    describe('#replyToTicket', () => {
        let freshdeshInstance;
        let validTicket;
        let ticketStatuses;
        let ticketPriorities;

        before(function() {
            this.timeout(10000);
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);

            let ticketStatusesRequest = freshdeshInstance.findTicketStatuses();
            let ticketPrioritiesRequest = freshdeshInstance.findTicketPriorities();

            ticketStatusesRequest.then((statuses) => {
                ticketStatuses = statuses;
            });
            ticketPrioritiesRequest.then((priorities) => {
                ticketPriorities = priorities;
            });

            return Q.all([
                ticketStatusesRequest,
                ticketPrioritiesRequest
            ]);
        });

        beforeEach(function() {
            this.timeout(10000);
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);

            let validContactWithEmail = new Contact('John Doe');
            validContactWithEmail.Email = 'john@test.cc';

            let contactSearchRequest = freshdeshInstance.findContactByEmail(validContactWithEmail.Email);

            return Q.spread([contactSearchRequest], function(retrievedContact) {
                validContactWithEmail.Id = retrievedContact.id;

                let ticketToAdd = new Ticket('Some description', '<h1>The html description</h1>', 'Ticket subject', ticketStatuses.Open, ticketPriorities.High);
                ticketToAdd.Requester = validContactWithEmail;
                let createTicketRequest = freshdeshInstance.createTicket(ticketToAdd);

                createTicketRequest.then((ticket) => {
                    validTicket = ticket;
                });

                return createTicketRequest;
            });
        });

        it('should succeed to reply to a ticket', function(done) {
            this.timeout(10000);

            let newTicketReply = new TicketReply(validTicket.Id);
            newTicketReply.Body = 'Hello, this is a test reply';
            let ticketReplyRequest = freshdeshInstance.replyToTicket(newTicketReply);

            return expect(ticketReplyRequest).to.eventually.be.fulfilled.and.notify(done);
        });

    });

    describe('#createNote', () => {
        let freshdeshInstance;
        let validTicket;

        before(function() {
            this.timeout(10000);
            freshdeshInstance = new Freshdesk(FRESHDESK_NAME, FRESHDESK_API_KEY);

            let validContactWithEmail = new Contact('John Doe');
            validContactWithEmail.Email = 'john@test.cc';

            let contactSearchRequest = freshdeshInstance.findContactByEmail(validContactWithEmail.Email);
            let ticketStatusRequest = freshdeshInstance.findTicketStatuses();
            let ticketPrioritiesRequest = freshdeshInstance.findTicketPriorities();

            return Q.spread([ticketStatusRequest, ticketPrioritiesRequest, contactSearchRequest], function(ticketStatuses, ticketPriorities, retrievedContact) {
                validContactWithEmail.Id = retrievedContact.id;

                let ticketToAdd = new Ticket('Some description', '<h1>The html description</h1>', 'Ticket subject', ticketStatuses.Open, ticketPriorities.High);
                ticketToAdd.Requester = validContactWithEmail;
                let createTicketRequest = freshdeshInstance.createTicket(ticketToAdd);

                createTicketRequest.then((ticket) => {
                    validTicket = ticket;
                });

                return createTicketRequest;
            });
        });

        describe('with requester', () => {

            it('should succeed with valid description, descriptionHtml and Requester', function(done) {
                this.timeout(10000);

                let noteToBeAdded = new Note(validTicket.Id);
                noteToBeAdded.Body = 'Test note';
                let ticketCreationRequest = freshdeshInstance.createNote(noteToBeAdded);

                expect(ticketCreationRequest).to.eventually.be.fulfilled.and.notify(done);
            });

        });

    });

});