from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'visitsonpage', views.VisitOnPageViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'visitsoncourse/', views.visits_on_course, name="visits"),
    path(r'daily-visitsoncourse/',
         views.daily_visits_on_course, name="daily-visits"),
]
