from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'logs', views.LogViewSet)
router.register(r'vertical', views.VerticalViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'course-structure/', views.get_course_structure, name="course-structure"),
    path(r'health/', views.health, name="health"),
    path(r'student-info/', views.get_student_information, name="student-information"),
    path(r'usersincourse/overview/', views.count_users_overview_course, name="students-overview")
]
