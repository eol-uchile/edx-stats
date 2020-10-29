from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APITestCase
from core.tests.mixins import JwtMixin, UserMixin
from core.models import CourseVertical


class TestCourseStructure(UserMixin, JwtMixin, APITestCase):
    url = reverse("course-structure")

    def setUp(self):
        self.user = self.create_user()
        CourseVertical.objects.create(
            course_name="Eol",
            course="block-v1:Test-EOL_T2+type@course+block@course",
            chapter="block-v1:Test-EOL_T2+type@chapter+block@a",
            chapter_name="first chapter",
            sequential="block-v1:Test-EOL_T2+type@sequential+block@a",
            sequential_name="first module",
            vertical="block-v1:Test-EOL_T2+type@vertical+block@a",
            vertical_name="video",
            block_id="block-v1:Test-EOL_T2+type@block+block@a",
            vertical_number=1,
            sequential_number=1,
            chapter_number=1,
            child_number=1,
            block_type="video",
            student_view_url="https://eol.cl/xblock/block-v1:Test-EOL_T2+type@vertical+block@a",
            lms_web_url="https://eol.cl/courses/course-v1:Test-EOL_T2+type@vertical+block@a"
        )
        self.existing_course = 'course-v1:Test-EOL_T2'
        self.non_existing_course = 'course-v1:Test-EOL_T1'

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)

    def test_no_search_field_fails(self):
        self.set_jwt_cookie()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)

    @patch('core.views.recoverUserCourseRoles')
    def test_course_empty(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': self.non_existing_course, 'role': 'staff'}]}
        response = self.client.get(self.url+"?search=LMS")
        self.assertEqual(response.status_code, 204)

    @patch('core.views.recoverUserCourseRoles')
    def test_course_not_allowed(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': self.non_existing_course, 'role': 'staff'}]}
        response = self.client.get(self.url+"?search=EOL")
        self.assertEqual(response.status_code, 403)

    @patch('core.views.recoverUserCourseRoles')
    def test_recover_structure_by_name(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': self.existing_course, 'role': 'staff'}]}
        response = self.client.get(self.url+"?search=EOL")
        self.assertEqual(response.status_code, 200)

    @patch('core.views.recoverUserCourseRoles')
    def test_recover_structure_by_code(self, mock_recoverUserCourseRoles):
        self.set_jwt_cookie()
        mock_recoverUserCourseRoles.return_value = {
            'roles': [{'course_id': self.existing_course, 'role': 'staff'}]}
        response = self.client.get(self.url+"?search="+self.existing_course)
        self.assertEqual(response.status_code, 200)


class TestLogs(APITestCase):
    url = "/api/core/logs/"

    def setUp(self):
        pass

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)


class TestVertical(APITestCase):
    url = "/api/core/vertical/"

    def setUp(self):
        pass

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)


class TestDocs(UserMixin, JwtMixin, APITestCase):
    url = reverse("api-root")

    def setUp(self):
        self.user = self.create_user()

    def test_redirect_to_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)

    def test_docs_render(self):
        self.set_jwt_cookie()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
