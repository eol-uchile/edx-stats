from django.http import JsonResponse
from django.db.models import Sum
from django.db.models.functions import Extract
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from visits.models import VisitOnPage
from visits.serializers import VisitOnPageSerializer
from core.authentication import recoverUserCourseRoles
from core.views import verify_time_range_course_params


class VisitOnPageViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers a list of Visits per page
    """
    queryset = VisitOnPage.objects.all()
    serializer_class = VisitOnPageSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['username']
    filterset_fields = {
        'course': ['contains'],
        'time': ['exact', 'lte', 'gte']
    }

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

    visits = query(course,time__lte,time__gte)
    if len(visits) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(visits)

@api_view()
def visits_on_course(request):
    """
    Compact user visits per verticals by days

    Expects 3 query parameters
    - course: course id in block-v1:COURSE+type@course+block@course format
    - time__gte (lower limit): a string datetime in isoformat
    - time__lte (upper limit): a string datetime in isoformat
    both timestamps are included on the query.

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    query = lambda x,y,z: VisitOnPage.objects.filter(
        course__icontains=x,
        time__lte=y,
        time__gte=z
    ).values("username", "vertical", "sequential", "chapter", "course").order_by("username", "vertical").annotate(total=Sum("count"))
    
    return manage_standard_request(request,query)


@api_view()
def daily_visits_per_chapter_on_course(request):
    """
    Compact user visits per verticals and add all for each day

    Expects 3 query parameters
    - course: course id in block-v1:COURSE+type@course+block@course format
    - time__gte (lower limit): a string datetime in isoformat
    - time__lte (upper limit): a string datetime in isoformat
    both timestamps are included on the query.

    Timezone is added on runtime
    """
    
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    query = lambda x,y,z: VisitOnPage.objects.filter(
        course__icontains=x,
        time__lte=y,
        time__gte=z
    ).extra({'date': "date(time)"}).values("chapter", "course", "date").order_by("date").annotate(total=Sum("count"))
    
    return manage_standard_request(request,query)

@api_view()
def daily_visits_on_course(request):
    """
    Compact user visits per verticals and add all for each day

    Expects 3 query parameters
    - course: course id in block-v1:COURSE+type@course+block@course format
    - time__gte (lower limit): a string datetime in isoformat
    - time__lte (upper limit): a string datetime in isoformat
    both timestamps are included on the query.

    Timezone is added on runtime
    """
    
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    query = lambda x,y,z: VisitOnPage.objects.filter(
        course__icontains=x,
        time__lte=y,
        time__gte=z
    ).extra({'date': "date(time)"}).values("course", "date").order_by("date").annotate(total=Sum("count"))
    
    return manage_standard_request(request, query)


@api_view()
def hourly_visits_overview_on_course(request):
    """
    Compact user visits per verticals. Use these and group by hour and day

    Expects 3 query parameters
    - course: course id in block-v1:COURSE+type@course+block@course format
    - time__gte (lower limit): a string datetime in isoformat
    - time__lte (upper limit): a string datetime in isoformat
    both timestamps are included on the query.

    Timezone is added on runtime
    """
    
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    query = lambda x,y,z: VisitOnPage.objects.filter(
        course__icontains=x,
        time__lte=y,
        time__gte=z
    ).annotate(day=Extract('time','week_day')).values("course","day").order_by("day").annotate(total=Sum("count"))
    # NOTE: the results given by week_day start on sunday. So Sunday is 1, Saturday is 7
    # https://docs.djangoproject.com/en/3.2/ref/models/database-functions/#extract
    
    return manage_standard_request(request,query)

@api_view()
def general_visits_overview_course(request):
    """
    Recover general visits overview for course.

    Recover total visits on period and total students
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

    total_visits = VisitOnPage.objects.filter(
        course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte,
    ).values("course").annotate(total=Sum("count")).first()['total']

    total_users = VisitOnPage.objects.filter(
        course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte,
    ).values("username").distinct("username").count()

    return JsonResponse({
        'total_visits': total_visits,
        'total_users': total_users,
    })