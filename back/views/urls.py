from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'videos', VideoViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'all/', videos_course, name="videos"),
    path(r'viewsonvideos/', videos_statistics, name="videos-views"),
    path(r'coverage/', videos_coverage, name="videos-coverage"),
    path(r'details/', video_details, name="video-details"),
]