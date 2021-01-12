from unittest.mock import patch
from datetime import datetime
from django.urls import reverse
from rest_framework.test import APITestCase
from core.tests.mixins import JwtMixin, UserMixin
from visits.models import VisitOnPage


class TestVisitsOnCourse(UserMixin, JwtMixin, APITestCase):
    url = reverse("visits")

    def setUp(self):
        self.user = self.create_user()
        VisitOnPage.objects.create(
            vertical="Test-EOL_T2+type@vertical+block@a",
            sequential="Test-EOL_T2+type@sequential+block@a",
            chapter="Test-EOL_T2+type@chapter+block@a",
            course="Test-EOL_T2",
            username="eol",
            count=1,
            time=datetime(2019, 9, 4, 1, 1, 1)
        )

    def test_redirect_to_login(self):

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_search_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "Test-Eol-Fail", "role": ""}]}
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_llimit_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "Test-Eol-Fail", "role": ""}]}
        response = self.client.get(self.url+"?search=Test-EOL_T1")
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_ulimit_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "Test-Eol-Fail", "role": ""}]}
        response = self.client.get(
            self.url+"?search=Test-EOL_T1&llimit=2019-09-04T00:00:00.000000")
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_course_not_allowed(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "Test-Eol-Fail", "role": ""}]}
        response = self.client.get(
            self.url+"?search=Test-EOL_T1&llimit=2019-09-04T00:00:00.000000&ulimit=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 403)

    @patch('visits.views.recoverUserCourseRoles')
    def test_course_empty(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'Test-EOL_T1', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?search=Test-EOL_T1&llimit=2019-09-04T00:00:00.000000&ulimit=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 204)

    @patch('visits.views.recoverUserCourseRoles')
    def test_course_has_content(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'Test-EOL_T2', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?search=Test-EOL_T2&llimit=2019-09-04T00:00:00.000000&ulimit=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 200)


class TestVisitOnPage(APITestCase):
    url = "/api/visits/visitsonpage/"

    def setUp(self):
        pass

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
