from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'logs', views.LogViewSet)
router.register(r'vertical', views.VerticalViewSet)
router.register(r'timeonpage', views.TimeOnPageViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'times/', views.times_on_course, name="times"),
    path(r'course-structure/', views.get_course_structure, name="times"),
    path('api/',include('rest_framework.urls', namespace='rest_framework'))
]
