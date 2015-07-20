/**
 * Created by ygil on 7/15/15.
 */

import bole from 'bole';
import kueFactory from './kue-factory';
import request from 'superagent';

let queue = kueFactory.createQueue();
let logger = bole("crakrevenue-factory");

queue.on('job enqueue', (id, type) => {
  logger.debug('Job %s got queued of type %s', id, type);
}).on('job failed', (id, errorMessage) => {
  logger.debug('Job %s failed with error: %s', id, errorMessage);
}).on('job failed attempt', (id, errorMessage, doneAttempts) => {
  logger.debug('Job %s failed with error: %s. Number of attempts :%s', id, errorMessage, doneAttempts);
});

bole.output({level: "debug", stream: process.stdout});

logger.info("running worker crakrevenue mailing worker");

let campaignCommanderEndpoint = process.env.CC_ENDPOINT || 'http://api.crakrevenue.com/1.0/segmentation/send-email';

let campaignCommanderData = {
  random: process.env.CC_RANDOM || "14E01000050FFE39",
  encrypt: process.env.CC_ENCRYPT || "EdX7CqkmlJnn8SA9MOPvq6HWLDl6Ha3D-jjYe99ALcPQK7o",
  template_id: process.env.CC_TEMPLATE_ID || "1681416"
}

let sendEmail = (email, subject, bodyHtml, bodyText) => {
  let postData = {
    random: campaignCommanderData.random,
    encrypt: campaignCommanderData.encrypt,
    template_id: campaignCommanderData.template_id,
    email: email,
    body_html: bodyHtml,
    bodyText: bodyText,
    subject: subject
  };

  return new Promise((resolve, reject) => {
    logger.info(campaignCommanderEndpoint);
    request
      .post(campaignCommanderEndpoint)
      .send(postData)
      .set('Accept', 'application/json')
      .end((err, res) => {
        (err) ? reject(err) : resolve(res);
      })
  });
}

queue.on('error', (error) => {
  logger.error('Oops', error);
});

queue.process('cr-email', (job, done) => {
  logger.info("Running task cr-email");

  sendEmail(job.data.email, job.data.subject, job.data.body_html, job.data.body_text)
    .then((response) => {
      logger.info("Sent email to %s. %s", job.data.email, JSON.stringify(response));
      done();
    }).catch((error) => {
      logger.error("Error sending email", error);
      return done(error);
    });
});

let gracefulShutdown = () => {
  queue.shutdown((process.env.SERVER_SHUTDOWN_WAIT_TIME || 2) * 1000, (err) => {
    logger.info("Kue shutdown: %s", err || '');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);