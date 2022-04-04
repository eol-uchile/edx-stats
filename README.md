# Statistics Dashboard

Custom dashboard to showcase statistics about student's progress on a course. 
It uses course logs to compute kpi about time spent by students and student interaction with videos.

Only course staff is authorized to see the dashboard's data. They are also enabled to view student contact information.

## Foreword

For detailed documentations refer to docs/.

## Requirements

* Sandbox environment with a subdomain and cors configuration (see docs/lms.md).
* Nginx configuration following docs/nginx.md
* Docker-Compose.
* An existing Redis server
* A working course discovery application to fetch courses

## Setup (dev) with local environment

If the eol development environment is on the same machine we can simply link the networks so that the analytics application can communicate with their services. This allows us to leverage the existing nginx configuration.

1. Configure the docker-compose.yml so the containers share the network with the LMS.
2. Configure the domain files for the frontend application on front/.env.development
3. Configure the JWT configuration on the backend and on the lms.
4. Start the backend app and run makemigrations, migrate and create super user.
5. Configure OAuth credentials (as described on the docs)
6. Lauch the docker-compose command with
```
docker-compose up --build -d
```
7. Add the nginx conf.d files to the nginx volume on the development environment. NOTE: there should be a http redirect to https on the nginx configuration. If there's none add the conf.d file.

## Setup (dev) with remote environment

If the development environment is not on the same machine we need add a local nginx container and redis server to the docker-compose like:
```
services:
...
  nginx:
    image: nginx:1.17.10
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - nginx/conf.d:/etc/nginx/conf.d/:ro
    depends_on:
      - stats
      - front
      - redis
  redis:
    image: redis:6
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    volumes:
      - data/redis:/data
      - redis/redis.conf:/usr/local/etc/redis/redis.conf
    environment:
      REDIS_REPLICATION_MODE: master
```
Then we need to fetch the SSL certificates from the remote machine and copy them to *nginx/conf.d/{domain name}/*. The domain name on the file *nginx/conf.d/analytics.conf* must match the new path.

## Developing on the analytics application

The frontend authenticates to the LMS using OAuth2. When properly configured this will allow the users to fetch courses from the course discovery service.

To add logs to the backend there are two options:
- put the logs on the logs/ folder with a volume or copying it to the container. Read them using the command ```loadlogs```
- configure the S3 credentials and download the logs from a remote bucket using the command ```downloadlogs```

To add stats to the application once the logs are loaded refer to the script **down_an_process.sh** which provides example commands for processing analytics

## Build and deploy

1. Configure domains for frontend on front/.env
2. Configure the JWT values and OAuth Credentials
3. Deploy on cluster with a managed solution for domain resolution and routing
