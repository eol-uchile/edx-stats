from unittest.mock import patch
from datetime import datetime
from django.urls import reverse
from rest_framework.test import APITestCase
from core.tests.mixins import JwtMixin, UserMixin
from times.models import TimeOnPage


class TestTimesOnCourse(UserMixin, JwtMixin, APITestCase):
    url = reverse("times")

    def setUp(self):
        self.user = self.create_user()
        TimeOnPage.objects.create(
            username="eol",
            session=1,
            delta_time_float=10.0,
            course="Test-EOL_T2",
            event_type_vertical="Test-EOL_T2+type@vertical+block@a",
            time=datetime(2019, 9, 4, 1, 1, 1)
        )

    def test_redirect_to_login(self):

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)

    def test_no_search_field_fails(self):
        self.set_jwt_cookie()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)

    def test_no_llimit_field_fails(self):
        self.set_jwt_cookie()
        response = self.client.get(self.url+"?search=Test-EOL_T1")
        self.assertEqual(response.status_code, 400)

    def test_no_ulimit_field_fails(self):
        self.set_jwt_cookie()
        response = self.client.get(
            self.url+"?search=Test-EOL_T1&llimit=2019-09-04T00:00:00.000000")
        self.assertEqual(response.status_code, 400)

    def test_course_not_allowed(self):
        self.set_jwt_cookie()
        response = self.client.get(
            self.url+"?search=Test-EOL_T1&llimit=2019-09-04T00:00:00.000000&ulimit=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 403)

    @patch('times.views.recoverUserCourseRoles')
    def test_course_empty(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'Test-EOL_T1', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?search=Test-EOL_T1&llimit=2019-09-04T00:00:00.000000&ulimit=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 204)

    @patch('times.views.recoverUserCourseRoles')
    def test_course_has_content(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'Test-EOL_T2', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?search=Test-EOL_T2&llimit=2019-09-04T00:00:00.000000&ulimit=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 200)


class TestTimeOnPage(APITestCase):
    url = "/api/times/timeonpage/"

    def setUp(self):
        pass

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
