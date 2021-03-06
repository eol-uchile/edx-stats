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
    times = TimeOnPage.objects.filter(
        course__icontains=course,
        time__lte=time__lte,
        time__gte=time__gte
    ).values("username", "event_type_vertical").order_by("username", "event_type_vertical").annotate(total=Sum("delta_time_float"))
    if len(times) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(times)
