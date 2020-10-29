import jwt
from django.conf import settings
from edx_rest_framework_extensions.auth.jwt.cookies import jwt_cookie_name
from edx_rest_framework_extensions.auth.jwt.tests.utils import generate_jwt_token, generate_unversioned_payload
from core.tests.factory import UserFactory


class UserMixin:
    """Provides utility methods for creating and authenticating users in test cases."""
    access_token = 'test-access-token'
    user_id = 'test-user-id'
    password = 'test'

    def create_user(self, **kwargs):
        """Create a user, with overrideable defaults."""
        not_provided = object()
        if kwargs.get('username', not_provided) is None:
            kwargs.pop('username')
        return UserFactory(password=self.password, **kwargs)

    def generate_jwt_token_header(self, user, secret=None):
        """Generate a valid JWT token header for authenticated requests."""
        secret = secret or settings.JWT_AUTH['JWT_ISSUERS'][0]['SECRET_KEY']

        # WARNING:
        #   If any test that uses this function fails with an error about a missing 'exp' or 'iat' or
        #     'is_restricted' claim in the payload, then do one of the following:
        #
        #   1. If Ecommerce's JWT_DECODE_HANDLER setting still points to a custom decoder inside Ecommerce,
        #      then a bug was introduced and the setting is no longer respected. If this is the case, do not
        #      add the claims to this test, and instead fix the bug. Or,
        #   2. If Ecommerce is being updated to no longer use a custom JWT_DECODE_HANDLER from Ecommerce, but is
        #      instead using the decode handler directly from edx-drf-extensions, any required claims can be
        #      added to this test and this warning can be removed.
        payload = {
            'username': user.username,
            'email': user.email,
            'iss': settings.JWT_AUTH['JWT_ISSUERS'][0]['ISSUER']
        }
        return "JWT {token}".format(token=jwt.encode(payload, secret).decode('utf-8'))


class JwtMixin:
    """ Mixin with JWT-related helper functions. """
    JWT_SECRET_KEY = settings.JWT_AUTH['JWT_ISSUERS'][0]['SECRET_KEY']
    issuer = settings.JWT_AUTH['JWT_ISSUERS'][0]['ISSUER']

    def generate_token(self, payload, secret=None):
        """Generate a JWT token with the provided payload."""
        secret = secret or self.JWT_SECRET_KEY
        token = jwt.encode(dict(payload, iss=self.issuer),
                           secret).decode('utf-8')
        return token

    def set_jwt_cookie(self, system_wide_role='admin', context='some_context'):
        """
        Set jwt token in cookies
        """
        role_data = '{system_wide_role}'.format(
            system_wide_role=system_wide_role)
        if context is not None:
            role_data += ':{context}'.format(context=context)

        payload = generate_unversioned_payload(self.user)
        payload.update({
            'roles': [role_data]
        })
        jwt_token = generate_jwt_token(payload)
        self.client.cookies[jwt_cookie_name()] = jwt_token
