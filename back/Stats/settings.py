"""
Django settings for Stats project.

Generated by 'django-admin startproject' using Django 2.2.15.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/

For reference on configs ENV and YAML see
https://github.com/eol-uchile/edx-platform/blob/eol/juniper.master/lms/envs/production.py
"""

import sys
import os
import datetime
import codecs
import yaml

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/


def get_env_setting(setting):
    """ Get the environment setting or return exception """
    try:
        return os.environ[setting]
    except KeyError:
        error_msg = u"Set the %s env variable" % setting
        raise ImproperlyConfigured(error_msg)


# A file path to a YAML file from which to load all the configuration for the statistics platform
CONFIG_FILE = get_env_setting('CONFIG_FILE')

with codecs.open(CONFIG_FILE, encoding='utf-8') as f:
    __config__ = yaml.safe_load(f)

    # ENV_TOKENS are included for reverse compatibility.
    # Removing them may break plugins that rely on them.
    ENV_TOKENS = __config__

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ENV_TOKENS.get('DJANGO_SECRET_KEY', "set-me")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', False) == 'True'

ALLOWED_HOSTS = ENV_TOKENS.get('ALLOWED_HOSTS', ['*', ""])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'core',
    'times',
    'visits',
    'webadmin',
    'django_celery_results',
    'django_celery_beat',
    'django_filters',
    'crispy_forms',
    # Enables frontend apps to retrieve CSRF tokens.
    'csrf.apps.CsrfAppConfig',
    'social_django',
]

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'edx_django_utils.cache.middleware.RequestCacheMiddleware',
    'edx_rest_framework_extensions.auth.jwt.middleware.JwtRedirectToLoginIfUnauthenticatedMiddleware',
    'edx_rest_framework_extensions.auth.jwt.middleware.JwtAuthCookieMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'edx_rest_framework_extensions.middleware.RequestMetricsMiddleware',
    'edx_rest_framework_extensions.auth.jwt.middleware.EnsureJWTAuthSettingsMiddleware',
    'edx_django_utils.cache.middleware.TieredCacheMiddleware',
]

ROOT_URLCONF = 'Stats.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Reference https://www.askpython.com/django/django-logging
LOGGING = {
    'version': 1,
    # Version of logging
    'disable_existing_loggers': False,
    'filters': {
        # information regarding filters
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'analytics-out.log',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'visits': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'core': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'times': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'webadmin': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

WSGI_APPLICATION = 'Stats.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases
DATABASES = ENV_TOKENS.get('DATABASES', {'default': {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': 'mydatabase',
}})


# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = ENV_TOKENS.get('TIME_ZONE', 'UTC')

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'edx_rest_framework_extensions.permissions.LoginRedirectIfUnauthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'edx_rest_framework_extensions.auth.jwt.authentication.JwtAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
}

CELERY_BROKER_URL = ENV_TOKENS.get('CELERY_BROKER_URL')
CELERY_BACKEND = ENV_TOKENS.get('CELERY_BACKEND')

# Oauth JWT Token verification config
JWT_AUTH = ENV_TOKENS.get('JWT_AUTH')

EDX_DRF_EXTENSIONS = {
    "OAUTH2_USER_INFO_URL": ENV_TOKENS.get('EDX_DRF_EXTENSIONS')['OAUTH2_USER_INFO_URL'],
    "JWT_PAYLOAD_USER_ATTRIBUTES": {
        'administrator': 'is_staff',
        'email': 'email',
    },
    'ENABLE_SET_REQUEST_USER_FOR_JWT_COOKIE': True,
}

# Custom settings
# Local Development Values
BACKEND_SERVICE_EDX_OAUTH2_KEY = ENV_TOKENS.get(
    'BACKEND_SERVICE_EDX_OAUTH2_KEY', "set-me-please")
BACKEND_SERVICE_EDX_OAUTH2_SECRET = ENV_TOKENS.get(
    'BACKEND_SERVICE_EDX_OAUTH2_SECRET', "set-me-please")  # Local Development Values
BACKEND_SERVICE_EDX_OAUTH2_PROVIDER_URL = ENV_TOKENS.get(
    'BACKEND_SERVICE_EDX_OAUTH2_PROVIDER_URL', "a.valid.url")
BACKEND_LMS_BASE_URL = ENV_TOKENS.get('BACKEND_LMS_BASE_URL', "a.valid.url")
BACKEND_CMS_BASE_URL = ENV_TOKENS.get('BACKEND_CMS_BASE_URL', "a.valid.url")

BACKEND_ALLOWED_ROLES = ENV_TOKENS.get('BACKEND_ALLOWED_ROLES', [
    'staff',
    'data_researcher',
    'instructor',
    'administrator'
])

# Should be an absolute path
# DOT NOT INCLUDE TRAILING /
BACKEND_LOGS_DIR = ENV_TOKENS.get(
    'BACKEND_LOGS_DIR', '/app/logs')

# EDX OAUTH2
SOCIAL_AUTH_EDX_OAUTH2_KEY = ENV_TOKENS.get(
    'BACKEND_SERVICE_EDX_OAUTH2_KEY', "set-me-please")
SOCIAL_AUTH_EDX_OAUTH2_SECRET = ENV_TOKENS.get(
    'BACKEND_SERVICE_EDX_OAUTH2_SECRET', "set-me-please")
SOCIAL_AUTH_EDX_OAUTH2_URL_ROOT = ENV_TOKENS.get(
    'BACKEND_LMS_BASE_URL', "a.valid.url")
SOCIAL_AUTH_EDX_OAUTH2_PUBLIC_URL_ROOT = ENV_TOKENS.get(
    'BACKEND_LMS_BASE_URL', "a.valid.url")
SOCIAL_AUTH_EDX_OAUTH2_JWS_HMAC_SIGNING_KEY = ENV_TOKENS.get(
    'JWT_AUTH').get('JWT_SECRET_KEY')
# SOCIAL_AUTH_EDX_OAUTH2_PROVIDER_CONFIGURATION_CACHE_TTL use default 1 Week
# SOCIAL_AUTH_EDX_OAUTH2_JWKS_CACHE_TTL use default 1 day.
SOCIAL_AUTH_STRATEGY = 'auth_backends.strategies.EdxDjangoStrategy'

AUTHENTICATION_BACKENDS = (
    'auth_backends.backends.EdXOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

LOGIN_REDIRECT_URL = '/'


CACHES = ENV_TOKENS.get("CACHE", {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6380/3",
        "OPTIONS": {
            "PASSWORD": "msecret318e401514dd45e97daf49d1d5c36cdbf9a7294395e84a9f52c08c6ad3699fcc0",
            "CLIENT_CLASS": "django_redis.client.DefaultClient"
        },
        "KEY_PREFIX": "stats"
    }
})

CACHE_TTL = ENV_TOKENS.get("CACHE_TTL", 60 * 60 * 6)  # s * m * h

# Bucket datalogs extraction

AWS_ACCESS_KEY_ID = ENV_TOKENS.get("AWS_ACCESS_KEY_ID", 'myaccessid')
AWS_SECRET_ACCESS_KEY = ENV_TOKENS.get("AWS_SECRET_ACCESS_KEY", 'mysecretkey')
AWS_STORAGE_BUCKET_NAME = ENV_TOKENS.get(
    "AWS_STORAGE_BUCKET_NAME", 'mybucket-2020')
AWS_DEFAULT_ACL = ENV_TOKENS.get("AWS_DEFAULT_ACL", 'public-read')
AWS_S3_REGION_NAME = ENV_TOKENS.get("AWS_S3_REGION_NAME", '')
AWS_S3_ENDPOINT_URL = ENV_TOKENS.get(
    "AWS_S3_ENDPOINT_URL", 'https://s3.nl-ams.scw.cloud')

"""
    Simple test configuration for backends and services
"""

if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'mydatabase'
    }

    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache"
        }
    }
