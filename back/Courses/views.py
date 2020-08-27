from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Q
from rest_framework import viewsets, permissions, generics, mixins, filters, status
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


@api_view()
@permission_classes((permissions.AllowAny,))
def get_course_structure(request):
    if "search" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data={"Search field required"})
    # Look on course name and course code
    verticals = CourseVertical.objects.filter(Q(
        course_name__icontains=request.query_params["search"])
        |
        Q(course__icontains=request.query_params["search"]))
    if len(verticals) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    courses = dict()
    for v in verticals:
        if v.course not in courses:
            courses[v.course] = dict({"name": v.course_name, "course_id": v.course, "chapters": {}})
        chapter = courses[v.course]["chapters"]
        # Check that sections exists
        if v.chapter_number not in chapter:
            chapter[v.chapter_number] = dict({"name": v.chapter_name})
        if v.sequential_number not in chapter[v.chapter_number]:
            chapter[v.chapter_number][v.sequential_number] = dict(
                {"name": v.sequential_number})
        if v.vertical_number not in chapter[v.chapter_number][v.sequential_number]:
            chapter[v.chapter_number][v.sequential_number][v.vertical_number] = dict(
                {"name": v.vertical_name, "block_id": v.block_id, "block_type": v.block_type, "block_url": v.student_view_url})

    courses_names = courses.keys()
    return Response({"courses": [courses[k] for k in courses_names]})
