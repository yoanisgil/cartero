# Cartero

A simple service to send asynchronous emails using [Kue](https://github.com/Automattic/kue) and Amazon's [SES](http://aws.amazon.com/ses/)
 
These services offers a single entry point for sending emails via /POST

# Development

A fully functional development environment is available with [Docker](https://docs.docker.com/installation/) and [Compose](https://docs.docker.com/compose/install/):

    $ cp docker-compose.yml.dist docker-compose.yml

    $ docker-compose run --rm npminstall
    
    $ docker-compose up router

After which the service documentation is available on `http://localhost:4000/doc`

**NOTE**: Make sure you properly set SES related environment variables

Documentation can be regenerated with:

    $ docker run --rm -v $(pwd):/srv/www yoanisgil/cartero npm run-script prestart
    
## Running tests

    $ docker run -v $(pwd):/srv/www --rm yoanisgil/cartero npm test


# Starting the API

    $ docker build -t yoanisgil/cartero .

    $ docker run -e REDIS_PORT=SERVER_PORT -e REDIS_HOST=SERVER_IP -d yoanisgil/cartero  node ./node_modules/babel/lib/_babel-node server.js

Since the project is using [Kue](https://github.com/Automattic/kue) as the distributed task scheduler, it requires a working Redis service already configured. Parameters controlling how to connect to the redis instance can be passed as environment variables:

- REDIS_PREFIX : The key prefix to be used (defaults to ES)
- REDIS_HOST: The redis server to connect to (defaults to localhost)
- REDIS_PORT: The port to connect to (defaults to 6379)
- REDIS_AUTH: The password to connect to redis (empty by default)
- REDIS_DB: The redis database to be used (defaults to 1)

Other environment variables are:

- HTTP_LISTEN: The interface to listen on for incoming connections.
- HTTP_PORT: The port to listen on for incoming connections.
- KUE_UI_LISTEN_PORT: Kue's UI interface to listen on for incoming connections.
- KUE_UI_LISTEN_INTERFACE: Kue's UI port to listen on for incoming connections.
- ATTEMPTS: In case of delivery failure, number of attempts to try before giving up.
- DELAY: Number of seconds to wait before attempting to send an email.
- SERVER_SHUTDOWN_WAIT_TIME: Number of seconds to wait before forcing the server to shutdown (i.e grant N seconds to gracefully shutdown the service)
- AWS_FROM_EMAIL: A SES verified email account allowed to send emails.
- AWS_ACCESS_KEY_ID: A SES authorized Access Key
- AWS_SECRET_ACCESS_KEY: The Secret Access Key associated to AWS_ACCESS_KEY_ID
- AWS_REGION: An AWS region identifier. Ex: 'us-west-2'

# Starting the worker

The worker can be started with:

    $ docker run -e REDIS_PORT=SERVER_PORT -e REDIS_HOST=SERVER_IP -d yoanisgil/cartero  node ./node_modules/babel/lib/_babel-node worker

The same environment variables described above can be used, alone with:

- WORKER_SHUTDOWN_WAIT_TIME: Number of seconds to wait before shutting down the worker (so that workers get to finish on going operations).