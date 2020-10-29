from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'logs', views.LogViewSet)
router.register(r'vertical', views.VerticalViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'course-structure/', views.get_course_structure, name="course-structure"),
]
