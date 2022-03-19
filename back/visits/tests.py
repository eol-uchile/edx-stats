from unittest.mock import patch
from datetime import datetime
from django.urls import reverse
from rest_framework.test import APITestCase
from core.tests.mixins import JwtMixin, UserMixin
from core.models import CourseVertical
from visits.models import VisitOnPage, CompletionOnBlock


class TestVisitsOnCourse(UserMixin, JwtMixin, APITestCase):
    url = reverse("visits")

    def setUp(self):
        self.user = self.create_user()
        CourseVertical.objects.create(
            is_active=True,
            course="block-v1:Test-EOL_T2+type@course+block@course",
            course_name="Test EOL T2",
            chapter="block-v1:Test-EOL_T2+type@chapter+block@a", 
            chapter_name="Chapter 1: Testing", 
            sequential="block-v1:Test-EOL_T2+type@sequential+block@0a",
            sequential_name="Introduction to testing",
            vertical="block-v1:Test-EOL_T2+type@vertical+block@a",
            vertical_name="Resume",
            block_id = "block-v1:Test-EOL_T2+type@html+block@a",
            vertical_number = 1,
            sequential_number = 1,
            chapter_number = 1,
            child_number = 1,
            block_type = "html",
            student_view_url = "http://eol.andhael.cl/xblock/Test-EOL_T2+type@html+block@a",
            lms_web_url = "http://eol.andhael.cl/courses/course-Test-EOL_T2/jump_to/Test-EOL_T2+type@html+block@a"
        )
        VisitOnPage.objects.create(
            vertical=CourseVertical.objects.filter(
                sequential="block-v1:Test-EOL_T2+type@sequential+block@0a",
                course="block-v1:Test-EOL_T2+type@course+block@course"
            ).first(),
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
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_llimit_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(self.url+"?course=block-v1:Test-EOL_T1")
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_ulimit_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T1&time__gte=2019-09-04T00:00:00.000000")
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_course_not_allowed(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T1&time__gte=2019-09-04T00:00:00.000000&time__lte=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 403)

    @patch('visits.views.recoverUserCourseRoles')
    def test_course_empty(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'course-v1:Test-EOL_T1', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T1&time__gte=2019-09-04T00:00:00.000000&time__lte=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 204)

    @patch('visits.views.recoverUserCourseRoles')
    def test_course_has_content(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'course-v1:Test-EOL_T2', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T2&time__gte=2019-09-04T00:00:00.000000&time__lte=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 200)


class TestVisitOnPage(APITestCase):
    url = "/api/visits/visitsonpage/"

    def setUp(self):
        pass

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)

class TestCompletionsOnCourse(UserMixin, JwtMixin, APITestCase):
    url = reverse("completions")

    def setUp(self):
        self.user = self.create_user()
        CourseVertical.objects.create(
            is_active=True,
            course="block-v1:Test-EOL_T2+type@course+block@course",
            course_name="Test EOL T2",
            chapter="block-v1:Test-EOL_T2+type@chapter+block@a", 
            chapter_name="Chapter 1: Testing", 
            sequential="block-v1:Test-EOL_T2+type@sequential+block@0a",
            sequential_name="Introduction to testing",
            vertical="block-v1:Test-EOL_T2+type@vertical+block@a",
            vertical_name="Resume",
            block_id = "block-v1:Test-EOL_T2+type@html+block@a",
            vertical_number = 1,
            sequential_number = 1,
            chapter_number = 1,
            child_number = 1,
            block_type = "html",
            student_view_url = "http://eol.andhael.cl/xblock/Test-EOL_T2+type@html+block@a",
            lms_web_url = "http://eol.andhael.cl/courses/course-Test-EOL_T2/jump_to/Test-EOL_T2+type@html+block@a"
        )
        CompletionOnBlock.objects.create(
            vertical=CourseVertical.objects.filter(
                sequential="block-v1:Test-EOL_T2+type@sequential+block@0a",
                course="block-v1:Test-EOL_T2+type@course+block@course"
            ).first(),
            username="eol",
            completion=1,
            time=datetime(2019, 9, 4, 1, 1, 1)
        )

    def test_redirect_to_login(self):

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_search_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_llimit_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(self.url+"?course=block-v1:Test-EOL_T1")
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_no_ulimit_field_fails(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T1&time__gte=2019-09-04T00:00:00.000000")
        self.assertEqual(response.status_code, 400)
    
    @patch('visits.views.recoverUserCourseRoles')
    def test_course_not_allowed(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {"roles": [{"course_id": "course-v1:Test-Eol-Fail", "role": ""}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T1&time__gte=2019-09-04T00:00:00.000000&time__lte=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 403)

    @patch('visits.views.recoverUserCourseRoles')
    def test_course_empty(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'course-v1:Test-EOL_T1', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T1&time__gte=2019-09-04T00:00:00.000000&time__lte=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 204)

    @patch('visits.views.recoverUserCourseRoles')
    def test_course_has_content(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': 'course-v1:Test-EOL_T2', 'role': 'staff'}]}
        response = self.client.get(
            self.url+"?course=block-v1:Test-EOL_T2&time__gte=2019-09-04T00:00:00.000000&time__lte=2019-09-05T00:00:00.000000")
        self.assertEqual(response.status_code, 200)

class TestCompletionOnPage(APITestCase):
    url = "/api/visits/completionsonpage/"

    def setUp(self):
        pass

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
