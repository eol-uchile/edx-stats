# Statistics Dashboard

Custom dashboard to showcase statistics about student's progress on a course. 
It uses course logs to compute kpi about time spent by students and student interaction with videos.

Only course staff is authorized to see the dashboard's data.

## Foreword

For detailed documentations refer to docs/.

## Requirements

* Sandbox environment with a subdomain and cors configuration
* A working course discovery application to fetch courses
* Nginx configuration following docs/nginx.md
* Docker-Compose
* An existing Redis server

## Local environment

If the eol development environment is on the same machine we can simply link the networks so that the analytics application can communicate with their services. This allows us to leverage the existing nginx configuration.

### Configure domain files
Configure the domain files for the frontend application on front/.env.* using the existing subdomain. The Dockerfile uses **.env.development** as default env file.

Also the EDX Django Rest Framework configuration needs the correct domain. Replace in **back/production.yamls** the fields OAUTH2_USER_INFO_URL on EDX_DRF_EXTENSIONS, BACKEND_SERVICE_EDX_OAUTH2_PROVIDER_URL, BACKEND_LMS_BASE_URL and BACKEND_CMS_BASE_URL.

### Configure Minio
Configure Minio credentials in **back/production.yaml**. It is required to match the LMS values:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_STORAGE_BUCKET_NAME

### Configure JWT
The backend only needs to check the Token's signature. It requires the following fields in **back/production.yaml** to match the LMS values:
- JWT_ALGORITHM
- JWT_AUTH header and cookies
- JWT_ISSUER
- JWT_ISSUERS
- JWT_SECRET_KEY
- JWT_PUBLIC_SIGNING_JWK_SET

### Enable Oauth access for Analytics
To enable different info recovery from the LMS without forwarding JWT tokens from the frontend it is necessary to add permissions via the LMS Django admin.
- Enter location `/admin/oauth2_provider/application/`
  * Create a new Application named **Analytics Backend** with
    * Client id: `analytics-oauth-client`
    * User: `1` (add a user with enough permissions to access the LMS API)
    * Redirect uris: `https://analytics.local-eol.uchile.cl/complete/edx-oauth2/` (Adapt subdomain to your SANDBOX_DOMAIN value. Consider that in this case every /api/ url is forwarded to the backend app via nginx)
    * Client type: `Public`
    * Authorization grant type: `Client credentials`
    * Client secret: `analytics-oauth-client-secret`
    * Skip authorization: checked
- Complete the fields BACKEND_SERVICE_EDX_OAUTH2 on **back/production.yaml**.

- Enter location `/admin/oauth_dispatch/applicationaccess/`
  * Add a new Application access with
    * Application: `Analytics Backend`
    * Scopes: `user_id,profile,email`

### DB Migrations
```
docker-compose up -d db stats
docker-compose exec stats python manage.py makemigrations
docker-compose exec stats python manage.py migrate
```

### Create user
```docker-compose exec stats python manage.py createsuperuser```

### Start docker
```docker-compose up --build -d```

### Update submodule
Run on the front/ ```git submodule update --init --recursive```

## Remote environment

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