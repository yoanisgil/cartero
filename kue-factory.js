/**
 * Created by ygil on 7/15/15.
 */

import kue from 'kue';
import bole from 'bole';

let logger = bole("factory");

module.exports.createQueue = () => {
    let queue = kue.createQueue({
        prefix: process.env.REDIS_PREFIX || 'ES',
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            auth: process.env.REDIS_AUTH || '',
            db: process.env.REDIS_DB || 1
        }
    });

    queue.on('job enqueue', (id, type) => {
        logger.debug('Job %s got queued of type %s', id, type);
    }).on('job failed', (id, errorMessage) => {
        logger.debug('Job %s failed with error: %s', id, errorMessage);
    }).on('job failed attempt', (id, errorMessage, doneAttempts) => {
        logger.debug('Job %s failed with error: %s. Number of attempts :%s', id, errorMessage, doneAttempts);
    }).on('error', (error) => {
        logger.error('Oops', error);
    });

    return queue;
}