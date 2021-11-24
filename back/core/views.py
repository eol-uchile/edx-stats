from django.http import JsonResponse
from django.db import DatabaseError, connection, transaction
import pytz
from datetime import datetime
from django.db.models import Q
from django.conf import settings
from django.views.decorators.cache import cache_page
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import CourseVertical, Log, Student
from core.serializers import LogSerializer, CourseVerticalSerializer
from core.authentication import recoverUserCourseRoles
from django.db import connections


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


def verify_time_range_course_params(request):
    """
    Parse the default query params for a time ranged
    request for a course

    Parameters:
        request - standard django-rest request wrapper
    Returns:
        course_id, ISO lower date, ISO upper date
    Raises:
        Exception with error message
    """
    if "course" not in request.query_params:
        raise Exception("Se requiere un curso válido.")

    if "time__lte" not in request.query_params:
        raise Exception("Se requiere una fecha límite inferior")

    if "time__gte" not in request.query_params:
        raise Exception("Se requiere una fecha límite superior")

    tz = pytz.timezone(settings.TIME_ZONE)
    try:
        time__gte = tz.localize(datetime.fromisoformat(
            request.query_params["time__gte"].replace("Z", "")))
        time__lte = tz.localize(datetime.fromisoformat(
            request.query_params["time__lte"].replace("Z", "")))
    except Exception as time_error:
        raise Exception(
            "Error en el formato de las fechas. Se espera un formato ISO.")

    if time__gte > time__lte:
        raise Exception("El límite inferior debe ser precedente al superior.")

    course = request.query_params["course"]
    return course, time__gte, time__lte


@api_view()
@cache_page(settings.CACHE_TTL, key_prefix="v1")
def get_course_structure(request):
    """
    Map a course structure using the recovered Verticals from the Edx API
    """
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    if "search" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Search field required")
    # Look on course name and course code
    verticals = CourseVertical.objects.filter(
        Q(course_name__icontains=request.query_params["search"]) |
        Q(course__icontains=request.query_params["search"].replace("course-v1", "block-v1")))
    if len(verticals) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)

    courses = dict()
    # Gather unique keys
    for v in verticals:
        if v.course not in courses:
            # Correct course id name
            course_id = v.course.split("+type@")[0]
            courses[v.course] = dict(
                {"name": v.course_name, "course_id": course_id, "chapters": {}})
        chapter = courses[v.course]["chapters"]
        # Check that sections exists
        if v.chapter_number not in chapter:
            chapter[v.chapter_number] = dict(
                {"name": v.chapter_name, "id": v.chapter})
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
        chapter_indexes = [int(k) for k in current_course["chapters"].keys()]
        chapter_indexes.sort()
        for chapter in chapter_indexes:
            current_chapter = current_course["chapters"][chapter]
            sequential_list = []
            sequential_indexes = [
                int(k) for k in current_chapter.keys() if k != 'name' and k != 'id']
            sequential_indexes.sort()
            for seq in sequential_indexes:
                current_seq = current_chapter[seq]
                vertical_list = []
                vertical_indexes = [int(k)
                                    for k in current_seq.keys() if k != 'name']
                vertical_indexes.sort()
                for vert in vertical_indexes:
                    # Add vertical object
                    vertical_list.append(current_seq[vert])
                # Save sequential with verticals
                sequential_list.append(
                    {"name": current_seq["name"], "verticals": vertical_list})
            # Save chapter with sequentials
            chapter_list.append(
                {"name": current_chapter["name"], "sequentials": sequential_list, "id": current_chapter["id"]})
        mapped_courses.append(
            {"name": current_course["name"], "id": current_course["course_id"], "chapters": chapter_list})
    # If values where filtered then the user has no permissions
    if len(mapped_courses) == 0:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los cursos solicitados")
    return Response({"courses": mapped_courses})


@transaction.non_atomic_requests
def health(_):
    """Allows a load balancer to verify this service is up.
    Checks the status of the database connection on which this service relies.
    Returns:
        HttpResponse: 200 if the service is available, with JSON data indicating the health of each required service
        HttpResponse: 503 if the service is unavailable, with JSON data indicating the health of each required service
    Example:
        >>> response = requests.get('https://course-discovery.edx.org/health')
        >>> response.status_code
        200
        >>> response.content
        '{"overall_status": "OK", "detailed_status": {"database_status": "OK"}}'
    """
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        database_status = u"OK"
    except DatabaseError:
        database_status = u"UNAVAILABLE"

    overall_status = u"OK" if (database_status == u"OK") else u"UNAVAILABLE"

    data = {
        'overall_status': overall_status,
        'detailed_status': {
            'database_status': database_status,
        },
    }

    if overall_status == u"OK":
        return JsonResponse(data)
    else:
        return JsonResponse(data, status=503)


@api_view()
def get_student_information(request):
    """
    Retrieve Student instance using loaded info from lms
    Checks if the user has role permissions
    """
    roles = recoverUserCourseRoles(request)
    allowed_list = [r['course_id'].replace(
        "course", "block") for r in roles['roles'] if r['role'] in settings.BACKEND_ALLOWED_ROLES]

    course = request.query_params["course"]

    # Check that user has permissions
    if course not in allowed_list:
        return Response(status=status.HTTP_403_FORBIDDEN, data="No tiene permisos para ver los datos en los cursos solicitados")

    if "username" not in request.query_params:
        return Response(status=status.HTTP_400_BAD_REQUEST, data="Username field required")

    student = Student.objects.filter(username=request.query_params["username"])
    if len(student) == 0:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return JsonResponse({'student': list(student.values('username', 'name', 'year_of_birth', 'gender', 'email', 'date_joined', 'country', 'last_update'))})


@api_view()
def count_users_overview_course(request):
    """
    Recover total students in a course
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

    with connections['lms'].cursor() as cursor:
        cursor.execute(
            "SELECT "
            "COUNT(auth_user.id) "
            "FROM "
            "auth_user "
            "JOIN student_courseenrollment ON auth_user.id = student_courseenrollment.user_id "
            "JOIN auth_userprofile ON auth_user.id = auth_userprofile.user_id "
            "WHERE course_id=%s "
            "AND is_staff=False",
        [course.replace('block-v1','course-v1')])
        total = cursor.fetchall()
        
    return JsonResponse({
        'total_users': total,
    })
