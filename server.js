/**
 * Created by ygil on 7/15/15.
 */

import app from './index'
import bole from 'bole';

let listenInterface = process.env.HTTP_LISTEN || '127.0.0.1';
let listenPort = process.env.HTTP_PORT || 3000;

bole.output({level: "debug", stream: process.stdout});
let logger = bole("server");

logger.info("server process starting");

let server = app.listen(listenPort, listenInterface, (error) => {
  if (error) {
    logger.error("Unable to listen for connections", error);
    process.exit(1);
  }

  logger.info("express is listening on http://%s:%s", listenInterface, listenPort);
});

let gracefulShutdown = () => {
  logger.info("Received kill signal, shutting down gracefully");

  server.close(() => {
    logger.info("Remaining connections closed. Bye!")
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Could not close existing connections in time. Forcing shutdown.");
    process.exit(1);
  }, (process.env.SERVER_SHUTDOWN_WAIT_TIME || 2) * 1000);

}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);