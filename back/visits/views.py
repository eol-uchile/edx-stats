from django.http import JsonResponse
from django.db.models import Sum, F
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
        vertical__is_active=True,
        vertical__course=x,
        time__lte=y,
        time__gte=z
    ).annotate(
        sequential=F('vertical__sequential'), 
        chapter=F('vertical__chapter'), 
        course=F('vertical__course')
    ).values("username", "vertical__vertical", "sequential", "chapter", "course").order_by("username", "vertical__vertical").annotate(total=Sum("count"))
    
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
        vertical__is_active=True,
        vertical__course=x,
        time__lte=y,
        time__gte=z
    ).annotate(
        chapter=F('vertical__chapter'), 
        course=F('vertical__course')
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
        vertical__is_active=True,
        vertical__course=x,
        time__lte=y,
        time__gte=z
    ).annotate(
        course=F('vertical__course')
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
        vertical__is_active=True,
        vertical__course=x,
        time__lte=y,
        time__gte=z,
    ).annotate(
        course=F('vertical__course')
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
        vertical__is_active=True,
        vertical__course=course,
        time__lte=time__lte,
        time__gte=time__gte,
    )
    total_visits = total_visits.values("vertical__course").annotate(total=Sum("count"))
    if total_visits.count() != 0:
        total_visits = total_visits[0]['total']
    else:
        total_visits = 0

    total_users = VisitOnPage.objects.filter(
        vertical__is_active=True,
        vertical__course=course,
        time__lte=time__lte,
        time__gte=time__gte,
    ).values("username").distinct("username").count()

    return JsonResponse({
        'total_visits': total_visits,
        'total_users': total_users,
    })

@api_view()
def detailed_visits_overview_course(request):
    """
    Compact visits on a course for date, chapter and sequential
    within a date period.
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
        vertical__is_active=True,
        vertical__course=course,
        time__lte=time__lte,
        time__gte=time__gte,
    )
    detailed_visits = {}
    #groupedBy fecha
    date_visits = total_visits.values("time").annotate(total=Sum("count"))
    detailed_visits['date'] = list(date_visits)

    #groupedBy modulo
    module_visits = total_visits.values("vertical__chapter").annotate(
        total=Sum("count"),
        name=F("vertical__chapter_name")    
    )
    detailed_visits['module'] = list(module_visits)

    #groupedBy unidad
    seq_visits = total_visits.values("vertical__sequential").annotate(
        total=Sum("count"), 
        name=F("vertical__sequential_name"),
        chap_number=F("vertical__chapter_number"),
        seq_number=F("vertical__sequential_number"),
    )
    detailed_visits['seq'] = list(seq_visits)

    total_visits = detailed_visits

    return JsonResponse({
        'total_visits': total_visits
    })