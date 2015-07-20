# Cartero

A service to send emails via the in house Campaing Commander mailing service.
 
These services offers a single entry point for sending emails via /POST (see below for further details on how to 
use it).

# Starting the API
    
    $ docker run -e REDIS_PORT=SERVER_PORT -e REDIS_HOST=SERVER_IP -d yoanisgil/cartero  node ./node_modules/babel/lib/_babel-node server.js
    
Since the project is using [Kue](https://github.com/Automattic/kue) as the distributed task scheduler, it requires a working Redis service already configrured. Parameters controlling how to connect to the redis instance can be passed as environment variables:

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
- CR_EMAIL_ATTEMPTS: In case of delivery failure, number of attempts to try before giving up.
- CR_EMAIL_DELAY: Number of seconds to wait before attempting to send an email.

    
# Starting the worker

The worker can be started with:

    $ docker run -e REDIS_PORT=SERVER_PORT -e REDIS_HOST=SERVER_IP -d yoanisgil/cartero  node ./node_modules/babel/lib/_babel-node crakrevenue-worker
    
The same environment variables described above can be used, alone with:

- SERVER_SHUTDOWN_WAIT_TIME: Number of seconds to wait before shutting down the worker (so that workers get to finish on going operations).
- CC_RANDOM: Campaign's commander random token.
- CC_ENCRYPT: Campaign's commander encryption token. 
- CC_TEMPLATE_ID: Campaign's commander template id. 

# Building the Docker image

The projet provides a Dockerfile which states how the application must be built. To do so, just run:

    $ docker build -t yoanisgil/cartero .
    
and provided that you have sufficient permissions, and that the new image works as expected, you can push to Docker Hub:

    $ docker push yoanisgil/cartero

# Development

A fully functional development environment is available with [Docker](https://docs.docker.com/installation/) and [Compose](https://docs.docker.com/compose/install/):
    
    $ docker-compose run --rm npminstall
    
    $ docker-compose up router

After which the service documentation is available on `http://localhost:4000/doc`

Documentation can always be regenreated with:

    $ docker run --rm -v $(pwd):/srv/www yoanisgil/cartero npm run-script prestart
    
## Running tests

    $ docker run -v $(pwd):/srv/www --rm yoanisgil/cartero npm test
