from django.db.models import Sum
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

    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    visits = VisitOnPage.objects.filter(
        course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte
    ).values("username", "vertical", "sequential", "chapter", "course").order_by("username", "vertical").annotate(total=Sum("count"))
    if len(visits) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(visits)


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

    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    visits = VisitOnPage.objects.filter(
        course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte
    ).extra({'date': "date(time)"}).values("chapter", "course", "date").order_by("date").annotate(total=Sum("count"))
    if len(visits) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(visits)
