# Statistics Dashboard

Custom dashboard to showcase statistics about student's progress on a course. 
It uses course logs to compute kpi about time spent by students and student interaction with videos (Work in Progress).

Only course staff is authorized to see the dashboard's data.

## Foreword

For detailed documentations refer to docs/.

## Requirements

* Sandbox environment with a subdomain and cors configuration (see docs/lms.md).
* Docker-Compose.

## Setup (dev)

1. Configure the docker-compose.yml so the containers share the network with the LMS.
2. Configure the domain files for the frontend application on .
3. Configure the JWT configuration on the backend and on the lms.
4. Start the backend app and run makemigrations, migrate and create super user.

## Build

**Work in Progress**