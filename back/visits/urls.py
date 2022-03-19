from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'visitsonpage', views.VisitOnPageViewSet)
router.register(r'completionsonpage', views.CompletionOnBlockViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'visitsoncourse/', views.visits_on_course, name="visits"),
    path(r'completionsoncourse/', views.completions_on_course, name="completions"),
    path(r'visitsoncourse/daily/',
         views.daily_visits_on_course, name="daily-visits"),
    path(r'visitsoncourse/daily/hour/',
         views.hourly_visits_overview_on_course, name="daily-hour-visits"),
    path(r'visitsoncourse/daily/chapter/',
         views.daily_visits_per_chapter_on_course, name="daily-chapter-visits"),
    path(r'visitsoncourse/overview/',
         views.general_visits_overview_course, name="visits-overview"),
     path(r'visitsoncourse/overview/detailed/',
         views.detailed_visits_overview_course, name="visits-overview-detailed"),
]
