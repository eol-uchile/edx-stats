from django.http import JsonResponse
from django.db.models.functions import Concat
from django.db.models import ExpressionWrapper, CharField, Value, F, Count
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

    try:
        course, time__gte, time__lte = verify_time_range_course_params(request)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST, data=str(e))

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    videos = query(course, time__lte, time__gte)
    if len(videos) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(videos)


@api_view()
def videos_statistics(request):
    """
    Returns active videos and its basics statistics

    Expects 3 query parameters
    - course: course id in block-v1:COURSE+type@course+block@course format

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
    def query(x,y,z): return Video.objects.filter(
        vertical__is_active=True,
        vertical__course__icontains=x
    ).values(
        'block_id', 'watch_time'
    ).order_by(
        'vertical__chapter_number',
        'vertical__sequential_number',
        'vertical__vertical_number'
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
            )
        ),
        name=F('vertical__vertical_name'),
        viewers=Count('viewonvideo')
    )
    return manage_standard_request(request, query)

@api_view()
def videos_coverage(request):
    """
    Compact user coverage for each video

    Expects 3 query parameters
    - course: course id in block-v1:COURSE+type@course+block@course format
    - time__gte (lower limit): a string datetime in isoformat
    - time__lte (upper limit): a string datetime in isoformat
    both timestamps are included on the query.

    Timezone is added on runtime
    """
    # Course will arrive in format block-v1:COURSE without +type@course-block@course
    # hence we do a icontains query
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

    segments_user_video = ViewOnVideo.objects.filter(
        video__vertical__is_active=True,
        video__vertical__course__icontains=course,
    ).annotate(
        video_duration=F('video__duration'),
        video_position=Concat(
            ExpressionWrapper(
                F('video__vertical__chapter_number'), output_field=CharField()
            ),
            Value('.'),
            ExpressionWrapper(
                F('video__vertical__sequential_number'), output_field=CharField()
            ),
            Value('.'),
            ExpressionWrapper(
                F('video__vertical__vertical_number'), output_field=CharField()
            )
        ),
        video_name=F('video__vertical__vertical_name')
    ).order_by('video__block_id')
    videos = []
    for viewer in segments_user_video:
        segments = Segment.objects.filter(
            view__id=viewer.id,
            time__lte=time__lte,
            time__gte=time__gte
        )
        length, _ = ut.klee_distance(segments)
        coverage = length/viewer.video_duration
        videos.append({
            'block_id': viewer.video.block_id,
            'position': viewer.video_position,
            'name': viewer.video_name,
            'coverage': coverage>=0.9
        })
    return Response(videos)

@api_view()
def videos_course(request):
    """
    Returns active videos with its position

    Expects 1 query parameters
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
    else:
        course = request.query_params["course"]

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    videos = Video.objects.filter(
        vertical__is_active=True,
        vertical__course__icontains=course
    ).values(
        'block_id'
    ).order_by(
        'vertical__chapter_number',
        'vertical__sequential_number',
        'vertical__vertical_number'
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
        ),
        name=F('vertical__vertical_name'),
    )
    return Response(videos)