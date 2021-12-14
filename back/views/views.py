from django.http import JsonResponse
from django.db.models.functions import Concat
from django.db.models import ExpressionWrapper, CharField, Value, F, Count, Q
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from views.models import Video, ViewOnVideo, Segment
from views.serializers import VideoSerializer
from core.authentication import recoverUserCourseRoles
from core.views import verify_time_range_course_params
import views.utils as ut


class VideoViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers video list of a course
    """
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['block_id']
    filterset_fields = {
        'vertical__course': ['contains'],
    }


def manage_standard_request(request, query):
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    if "course" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Se requiere un curso válido.")
    else:
        course = request.query_params["course"]

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    videos = query(course)
    if len(videos) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(videos)

@api_view()
def videos_course(request):
    """
    Returns active videos with its position

    Expects 1 query parameter
    - course: course id in block-v1:COURSE+type@course+block@course format

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    
    def query(x): return Video.objects.filter(
        vertical__is_active=True,
        vertical__course__icontains=x
    ).values(
        'block_id', 'duration'
    ).order_by(
        'vertical__chapter_number',
        'vertical__sequential_number',
        'vertical__vertical_number',
        'vertical__child_number'
    ).annotate(
        position=Concat(
            ExpressionWrapper(
                F('vertical__chapter_number'), output_field=CharField()
            ),
            Value('.'),
            ExpressionWrapper(
                F('vertical__sequential_number'), output_field=CharField()
            ),
            Value('.'),
            ExpressionWrapper(
                F('vertical__vertical_number'), output_field=CharField()
            ),
            Value('.'),
            ExpressionWrapper(
                F('vertical__child_number'), output_field=CharField()
            ),
        ),
        name=F('vertical__vertical_name'),
    )
    return manage_standard_request(request, query)

@api_view()
def videos_statistics(request):
    """
    Returns active videos and its basics statistics
    Expects 1 query parameter
    - course: course id in block-v1:COURSE+type@course+block@course format

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    def query(x): return Video.objects.filter(
        vertical__is_active=True,
        vertical__course__icontains=x
    ).values(
        'block_id', 'watch_time'
    ).order_by(
        'vertical__chapter_number',
        'vertical__sequential_number',
        'vertical__vertical_number',
        'vertical__child_number'
    ).annotate(
        viewers=Count('viewonvideo')
    )
    return manage_standard_request(request, query)

@api_view()
def videos_coverage(request):
    """
    Compact user coverage for each video

    Expects 1 query parameter
    - course: course id in block-v1:COURSE+type@course+block@course format

    Timezone is added on runtime
    """
    def query(x): return Video.objects.filter(
        vertical__is_active=True,
        vertical__course__icontains=x,
    ).values(
        'block_id',
    ).order_by(
        'vertical__chapter_number',
        'vertical__sequential_number',
        'vertical__vertical_number',
        'vertical__child_number'
    ).annotate(
        completed=Count('viewonvideo', filter=Q(viewonvideo__coverage__gte = 0.9)),
        uncompleted=Count('viewonvideo', filter=Q(viewonvideo__coverage__lt = 0.9)),
    )
    return manage_standard_request(request, query)

@api_view()
def video_details(request):
    """
    Returns user partitions for the video requested, grouped in a dictionary,
    counting uniques visualizations and repetitions.

    Expects 1 query parameter
    - course: course id in block-v1:COURSE+type@course+block@course format

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    if "course" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Se requiere un curso válido.")
    course = request.query_params["course"]

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    if "video" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Se requiere un video válido.")
    video_id = request.query_params["video"]

    video_viewers = ViewOnVideo.objects.filter(
        video__vertical__is_active=True,
        video__vertical__course__icontains=course,
        video__block_id=video_id
    )
    viewers = []
    for viewer in video_viewers:
        segments = Segment.objects.filter(
            view__id=viewer.id
        )
        partitions = ut.make_partition_with_repetition(segments)
        viewers.append(partitions)

    if len(viewers) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(viewers)