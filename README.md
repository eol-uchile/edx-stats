# Statistics Dashboard

Custom dashboard to showcase statistics about student's progress on a course.
It uses course logs to compute kpi about time spent by students and student interaction with videos.

Only course staff is authorized to see the dashboard's data.

## Foreword

For detailed documentations refer to docs/.

## Requirements

* A working course discovery application to fetch courses.
* Docker-Compose Plugin.
* An existing sandbox `development-edx` working with a subsubdomain (ex `analytics`) and cors configuration.

## Environment

### Local environment

If the eol development environment (`development-edx` repository) is on the same machine we can simply link the networks so that the analytics application can communicate with their services. This allows us to leverage the existing nginx and redis configuration.

Existing configuration is already working with `local-eol` subdomain.

### Remote environment

In this scenario, the sandbox running from the eol development environment provides nginx and redis services to the application, but settings need to be changed to point to remote LMS, Discovery and Minio services.

#### Configure

TODO


## Enable Oauth access for Analytics
To enable different info recovery from the LMS without forwarding JWT tokens from the frontend it is necessary to add permissions via the LMS Django admin.
- Enter location `/admin/auth/user/`
  * Create a new User named **analytics_service_user**
    * Password: `[random]`
    * Email: `analytics@local-eol.uchile.cl`
    * Is active: checked
    * Is staff: checked

- Enter location `/admin/oauth2_provider/application/`
  * Create a new Application named **Analytics Backend** with
    * Client id: `analytics-backend-client`
    * User: Search `analytics_service_user`
    * Redirect uris: Empty/No value
    * Client type: `Confidential`
    * Authorization grant type: `Client credentials`
    * Client secret: `analytics-backend-client-secret` (Use a secret password in production)
    * Skip authorization: checked

## DB Migrations
```
docker compose up -d db stats
docker compose exec stats python manage.py migrate
```

## Create user
```docker compose exec stats python manage.py createsuperuser```

## Start docker
```docker compose up --build -d```

## Update submodule
Run on the front/ ```git submodule update --init --recursive```

## Developing on the analytics application

The frontend authenticates to the LMS using OAuth2. When properly configured this will allow the users to fetch courses from the course discovery service. (FIXME: This assumption is wrong, the frontend always redirect to authenticate against its parent domain)

To add logs to the backend there are two options:
- put the logs on the logs/ folder with a volume or copying it to the container. Read them using the command ```loadlogs```
- configure the S3 credentials and download the logs from a remote bucket using the command ```downloadlogs```

To add stats to the application once the logs are loaded refer to the script **down_an_process.sh** which provides example commands for processing analytics
