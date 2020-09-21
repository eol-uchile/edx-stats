from django.http import HttpResponse
from django.db.models import Q, Sum
from rest_framework import viewsets, permissions, generics, mixins, filters, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from .models import CourseVertical, Log, TimeOnPage
from .serializers import LogSerializer, CourseVerticalSerializer, TimeOnPageSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
from .autentication import recoverUserCourseRoles

class LogViewSet(viewsets.ModelViewSet):
    """
    API to recover individual logs
    """
    queryset = Log.objects.all().order_by('-time')
    serializer_class = LogSerializer


class VerticalViewSet(viewsets.ModelViewSet):
    """
    API that gets verticals
    """
    queryset = CourseVertical.objects.all()
    serializer_class = CourseVerticalSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['course']


class TimeOnPageViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers a list of Timed sessions per page
    """
    queryset = TimeOnPage.objects.all()
    serializer_class = TimeOnPageSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['username']
    filterset_fields = ['course']


@api_view()
def times_on_course(request):
    """
    Compact user time sessions for verticals
    """
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'] for r  in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES ]

    if "search" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Search field required")

    # Check that user has permissions
    if request.query_params["search"] not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN,  data="No tiene permisos para ver los datos en los cursos solicitados")

    times = TimeOnPage.objects.filter(course=request.query_params["search"]).values("username","event_type_vertical").order_by("username","event_type_vertical").annotate(total=Sum("delta_time_float"))
    if len(times) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(times)


@api_view()
def get_course_structure(request):
    """
    Map a course structure using the recovered Verticals from the Edx API
    """
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'] for r  in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES ]

    if "search" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Search field required")
    # Look on course name and course code
    verticals = CourseVertical.objects.filter(
        Q(course_name__icontains=request.query_params["search"])|
        Q(course__icontains=request.query_params["search"].replace("course-v1","block-v1")))
    if len(verticals) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    courses = dict()
    # Gather unique keys
    for v in verticals:
        if v.course not in courses:
            # Correct course id name
            course_id = v.course.split("+type@")[0].replace("block","course")
            courses[v.course] = dict({"name": v.course_name, "course_id": course_id, "chapters": {}})
        chapter = courses[v.course]["chapters"]
        # Check that sections exists
        if v.chapter_number not in chapter:
            chapter[v.chapter_number] = dict({"name": v.chapter_name})
        if v.sequential_number not in chapter[v.chapter_number]:
            chapter[v.chapter_number][v.sequential_number] = dict(
                {"name": v.sequential_name})
        if v.vertical_number not in chapter[v.chapter_number][v.sequential_number]:
            chapter[v.chapter_number][v.sequential_number][v.vertical_number] = dict(
                {"name": v.vertical_name, "block_id": v.block_id, "block_type": v.block_type, "block_url": v.student_view_url, "vertical_id": v.vertical})
    # Parse keys as arrays
    courses_names = courses.keys()
    mapped_courses = []
    for course in courses_names:
        current_course = courses[course]
        # Remove courses that are not on the allowed list
        if current_course["course_id"] not in allowed_list:
            continue
        chapter_list = []
        for chapter in current_course["chapters"].keys():
            current_chapter = current_course["chapters"][chapter]
            sequential_list = []
            for seq in current_chapter.keys():
                if seq != "name":
                    current_seq = current_chapter[seq]
                    vertical_list = []         
                    for vert in current_seq.keys():
                        if vert != "name":
                            # Add vertical object
                            vertical_list.append(current_seq[vert])
                    # Save sequential with verticals
                    sequential_list.append({"name": current_seq["name"], "verticals": vertical_list})
            # Save chapter with sequentials
            chapter_list.append({"name": current_chapter["name"], "sequentials": sequential_list})
        mapped_courses.append({"name": current_course["name"], "id": current_course["course_id"], "chapters": chapter_list})
    # If values where filtered then the user has no permissions
    if len(mapped_courses) == 0:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los cursos solicitados")
    return Response({"courses": mapped_courses})
