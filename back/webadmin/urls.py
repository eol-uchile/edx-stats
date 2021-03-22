from django.urls import path, include
from rest_framework import routers
from webadmin import views

router = routers.DefaultRouter()
router.register(r'announcement', views.AnnouncementViewSet)

urlpatterns = [
    path(r'', include(router.urls)),
]
