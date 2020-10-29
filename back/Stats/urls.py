"""
Stats URL Configuration
"""
from django.contrib import admin
from django.urls import include, path
from auth_backends.urls import oauth2_urlpatterns

urlpatterns = [
    path('api/', include(oauth2_urlpatterns)),
    path('api/core/', include('core.urls')),
    path('api/times/', include('times.urls')),
    path('api/visits/', include('visits.urls')),
    path('api/admin/', admin.site.urls),
    path('api/rest/', include('rest_framework.urls', namespace='rest_framework'))
]
