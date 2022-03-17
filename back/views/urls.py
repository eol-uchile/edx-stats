from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'video', VideoViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'all/', all_active_videos, name="videos"),
    path(r'viewsonvideos/', views_on_course, name="videos-views"),
    path(r'coverage/', videos_coverage, name="videos-coverage"),
    path(r'details/', video_details, name="video-details"),
]
