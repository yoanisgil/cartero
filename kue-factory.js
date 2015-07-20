/**
 * Created by ygil on 7/15/15.
 */

let kue = require('kue');

module.exports.createQueue = () => {
  return kue.createQueue({
    prefix: process.env.REDIS_PREFIX || 'ES',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      auth: process.env.REDIS_AUTH || '',
      db: process.env.REDIS_DB || 1
    }
  });
}