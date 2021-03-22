from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters, status
from webadmin.models import Announcement
from webadmin.serializers import AnnouncementSerializer


class AnnouncementViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers a list of Visits per page
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['message']
    filterset_fields = {
        'published': ['exact'],
        'created_at': ['exact', 'lte', 'gte', 'isnull']
    }
