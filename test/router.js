/**
 * Created by ygil on 7/17/15.
 */

import chai from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';
import request from 'superagent';
import leche from 'leche';

describe('Client', () => {
  var app, appServer;

  const LISTEN_PORT = process.env.TEST_PORT || 9999;
  const SEND_EMAIL_ENDPOINT = 'http://localhost:' + LISTEN_PORT + '/send-email';

  let kueMock = {};

  kueMock.createQueue = sinon.stub().returns(kueMock);
  kueMock.attempts = sinon.stub().returns(kueMock);
  kueMock.delay = sinon.stub().returns(kueMock);
  kueMock.backoff = sinon.stub().returns(kueMock);
  kueMock.create = sinon.stub().returns(kueMock);
  kueMock.save = sinon.stub();

  let email = "user@example.com";
  let subject = "welcome";
  let bodyHtml = "the html body";
  let bodyText = "the text body";

  before((done) => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    mockery.registerMock('kue', kueMock);

    app = require('../index');

    appServer = app.listen(LISTEN_PORT, (err, result) => {
      (err) ? done(err) : done();
    })
  });

  after(() => {
    mockery.disable();
    appServer.close();
  });

  beforeEach(() => {
    kueMock.save.reset();
  })


  it('should exist', (done) => {
    chai.expect(app).to.exist;
    done();
  });

  it('should send 200 after posting job to queue', (done) => {
    let postData = {email: email, subject: subject, body_html: bodyHtml, body_text: bodyText};
    let serverResponse = {status: 200};

    kueMock.save.yields(null, {data: serverResponse});

    request
      .post(SEND_EMAIL_ENDPOINT)
      .send(postData)
      .set('Accept', 'application/json')
      .end((error, response) => {
        chai.expect(response.text).to.be.equal(JSON.stringify(serverResponse));
        chai.expect(response.status).to.be.equal(200);
        done();
      })
  });

  it('should send 500 on failure to post job to queue', (done) => {
    let postData = {email: email, subject: subject, body_html: bodyHtml, body_text: bodyText};
    kueMock.save.yields(new Error('error'), null);

    request
      .post(SEND_EMAIL_ENDPOINT)
      .send(postData)
      .set('Accept', 'application/json')
      .end((error, response) => {
        chai.expect(error).to.exist;
        chai.expect(response.status).to.be.equal(500);
        done();
      })
  });

  it('should send 200 after posting job to queue', (done) => {
    let postData = {email: email, subject: subject, body_html: bodyHtml, body_text: bodyText};
    let serverResponse = {status: 200};

    kueMock.save.yields(null, {data: serverResponse});

    request
      .post(SEND_EMAIL_ENDPOINT)
      .send(postData)
      .set('Accept', 'application/json')
      .end((error, response) => {
        chai.expect(response.text).to.be.equal(JSON.stringify(serverResponse));
        done();
      })
  });

  leche.withData({
    "null email": [null, subject, bodyHtml, bodyText],
    "empty email": ["", subject, bodyHtml, bodyText],
    "malformed email": ["user@", subject, bodyHtml, bodyText],
    "null subject": [email, null, bodyHtml, bodyText],
    "empty subject": [email, "", bodyHtml, bodyText],
    "null html body": [email, null, subject, bodyText],
    "empty html body": [email, subject, "", bodyText],
    "null html text": [email, subject, bodyHtml, null],
    "empty html text": [email, subject, bodyHtml, ""]
  }, (email, subject, bodyHtml, bodyText) => {
    it('should fail', (done) => {
      let postData = {email: email, subject: subject, body_html: bodyHtml, body_text: bodyText}
      request
        .post(SEND_EMAIL_ENDPOINT)
        .send(postData)
        .set('Accept', 'application/json')
        .end((error) => {
          chai.expect(error).to.exist;
          chai.expect(error.response.statusCode).to.be.equal(400);
          chai.expect(error.response.type).to.be.equal('application/json');

          done();
        })
    })
  });

})
;