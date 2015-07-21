/**
 * Created by ygil on 7/15/15.
 */

import bole from 'bole';
import kueFactory from './kue-factory';
import request from 'superagent';
import awsDelivery from './delivery/aws';

let queue = kueFactory.createQueue();
let logger = bole("worker");

bole.output({level: "debug", stream: process.stdout});

logger.info("running mailing worker");

let sendEmail = (email, subject, bodyHtml, bodyText) => {
    return awsDelivery.send(process.env.AWS_FROM_EMAIL, email, subject, bodyHtml, bodyText);
}

queue.process('cr-email', (job, done) => {
    logger.info("Running task cr-email");

    sendEmail([job.data.email], job.data.subject, job.data.body_html, job.data.body_text)
        .then((response) => {
            logger.info("Sent email to %s. %s", job.data.email, JSON.stringify(response));
            done();
        }).catch((error) => {
            logger.error("Error sending email", JSON.stringify(error));
            return done(error);
        });
});

let gracefulShutdown = () => {
    queue.shutdown((process.env.WORKER_SHUTDOWN_WAIT_TIME || 2) * 1000, (err) => {
        logger.info("Kue shutdown: %s", err || '');
        process.exit(0);
    });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
