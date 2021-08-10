from django.http import JsonResponse
from django.db.models import Sum
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from times.models import TimeOnPage
from times.serializers import TimeOnPageSerializer
from core.authentication import recoverUserCourseRoles
from core.views import verify_time_range_course_params


class TimeOnPageViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers a list of Timed sessions per page
    """
    queryset = TimeOnPage.objects.all()
    serializer_class = TimeOnPageSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['username']
    filterset_fields = ['course']


def manage_standard_request(request, query):
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    try:
        course, time__gte, time__lte = verify_time_range_course_params(request)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST, data=str(e))

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    visits = query(course, time__lte, time__gte)
    if len(visits) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(visits)


@api_view()
def times_on_course(request):
    """
    Compact user time sessions for verticals

    Expects 3 query parameters
    - course: course id in course-block format
    - time__gte (lower limit): a string datetime in isoformat 
    - time__lte (upper limit): a string datetime in isoformat
    both timestamps are included on the query.

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    def query(x, y, z): return TimeOnPage.objects.filter(
        vertical__course__icontains=x,
        time__lte=y,
        time__gte=z
    ).values("username", "vertical").order_by("username", "vertical").annotate(total=Sum("delta_time_float"))

    return manage_standard_request(request, query)


@api_view()
def general_times_overview_course(request):
    """
    Return total of seconds viewed on a course
    """
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    try:
        course, time__gte, time__lte = verify_time_range_course_params(request)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST, data=str(e))

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    total_course_time = TimeOnPage.objects.filter(
        vertical__course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte,
    )
    
    total_course_time = total_course_time.values("vertical__course").annotate(total=Sum("delta_time_float"))
    if total_course_time.count() != 0:
        total_course_time= total_course_time[0]['total']
    else:
        total_course_time = 0
    
    return JsonResponse({
        'total_time': total_course_time,
    })

@api_view()
def detailed_times_overview_course(request):
    """
    Compact seconds viewed on a course for date within a date period.
    """
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    try:
        course, time__gte, time__lte = verify_time_range_course_params(request)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST, data=str(e))

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    total_course_time = TimeOnPage.objects.filter(
        vertical__course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte,
    )
    
    total_course_time = total_course_time.values("time").annotate(total=Sum("delta_time_float"))
    total_course_time = list(total_course_time)

    return JsonResponse({
        'total_time': total_course_time,
    })