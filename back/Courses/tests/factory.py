from factory import Sequence, PostGenerationMethodCall
from factory.django import DjangoModelFactory
from django.contrib.auth.models import User

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = Sequence(lambda n: 'lms_test_user %d' % n)
    email = Sequence(lambda n: 'lms_test_%s@eol.cl' % n)
    first_name = 'Stats'
    last_name = 'User'
    password = PostGenerationMethodCall('set_password', 'somethingSecure')
    is_active = True
    is_superuser = False
    is_staff = False