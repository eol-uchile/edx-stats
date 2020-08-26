from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, mixins, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import CourseVertical, Log, TimeOnPage
from .serializers import LogSerializer, CourseVerticalSerializer, TimeOnPageSerializer
from django_filters.rest_framework import DjangoFilterBackend 

class LogViewSet(viewsets.ModelViewSet):
    """
    API that I like to log
    """
    queryset = Log.objects.all().order_by('-time')
    serializer_class = LogSerializer
    permission_classes = [permissions.AllowAny]


class VerticalViewSet(viewsets.ModelViewSet):
    """
    API that gets verticals
    """
    queryset = CourseVertical.objects.all()
    serializer_class = CourseVerticalSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['course']


class TimeOnPageViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers a list of Timed sessions per page
    """
    queryset = TimeOnPage.objects.all()
    serializer_class = TimeOnPageSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['username']
    filterset_fields = ['course']


@api_view()
@permission_classes((permissions.AllowAny,))
def times_on_course(request):
    return Response({"message": "Hello, world!"})
