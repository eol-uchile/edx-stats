from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'videos', VideoViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
    path(r'viewsonvideos/', videos_statistics, name="video-views"),
    path(r'coverage/', videos_coverage, name="video-coverage"),
    #path(r'all/', videos_course, name="videos"),
]
