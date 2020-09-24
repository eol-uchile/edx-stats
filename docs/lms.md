# JWT and CORS Configuration 

## Backend

The backend only needs to check the Token's signature. It requires the following fields to match the LMS values:
* JWT_ALGORITHM
* JWT_ISSUER
* JWT_ISSUERS
* JWT_SECRET_KEY
* JWT_PUBLIC_SIGNING_JWK_SET
* JWT_AUTH header and cookies

Also the EDX Django Rest Framework configuration needs the correct domain. Replace the field OAUTH2_USER_INFO_URL on EDX_DRF_EXTENSIONS.

## LMS

On the lms.yml file the changes are:
* Add the eol-stats subdomain to the LOGIN_REDIRECT_WHITELIST, i.e.:
```
LOGIN_REDIRECT_WHITELIST:
- cms.eol.andhael.cl
- front.eol.andhael.cl
```
* Configure the JWT_AUTH to support both JWT_ISSUER and JWT_ISSUERS, i.e.:
```
JWT_AUDIENCE: set-me-please
JWT_ISSUER: issuer
JWT_ISSUERS:
    - AUDIENCE: set-me-please
        ISSUER: issuer
        SECRET_KEY: jwt_secret
JWT_SECRET_KEY: jwt_secret
```
* Enable CORS HEADERS
```
FEATURES:
    ...
    ENABLE_CORS_HEADERS: true
```

On the LMS production.py configuration file add:
```
from corsheaders.defaults import default_headers as corsheaders_default_headers
...
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = ['front.eol.andhael.cl']
CORS_ALLOW_HEADERS = corsheaders_default_headers + (
    'use-jwt-cookie',
)
```
This makes the LMS accept our domain and attach the CORS headers on the response for the pre-flight request OPTIONS. Tutor adds it on the [nginx](https://github.com/overhangio/tutor/commit/055c3cad3f8d1acd6934e82983349e27558771a6), but it is unclear that it works without adding this configuration to the LMS.

## LMS OAuth and Backend config

To enable different info recovery from the LMS without forwarding JWT tokens from the frontend it is necessary to add permissions via the django admin.
1. Go to Django OAuth Toolkit > Aplications.
2. Add new.
3. Add your domain URL, i.e. https://front.eol.andhael.cl/api/complete/edx-oauth2/ (consider that in this case every /api/ url is forwarded to the backend app via nginx).
4. Select Client Credentials as Authorization type and add a user with enough permissions to access the LMS API. The client id and client secret should be generated automatically .
5. Enable Skip Authorization, set Public client type, and add a descriptive name like Stats App or so.
6. Finally **complete the fields** on BACKEND_SERVICE_EDX_OAUTH2 and SOCIAL_AUTH_EDX_OAUTH2 on the **Backend Application**

