from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'timeonpage', views.TimeOnPageViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'timeoncourse/', views.times_on_course, name="times"),
    path(r'timeoncourse/overview/', views.general_times_overview_course, name="times-overview"),
    path(r'timeoncourse/overview/detailed/', views.detailed_times_overview_course, name="times-overview-detailed"),
]
