import requests as req_client
from django.core.cache import cache
from django.conf import settings

def make_user_jwt_get_request(request, url, **kwargs):
    cookies=request._request.COOKIES.copy()
    # Remove already processed JWT token
    cookies.pop('edx-jwt-cookie')
    response = req_client.get(url, cookies=cookies, **kwargs)
    print(url)
    return response

def recoverUserCourseRoles(request):
    user_email = request.user.email
    courses = cache.get(user_email+'-'+settings.BACKEND_LMS_BASE_URL+"/api/enrollment/v1/roles/", "has_expired")
    if courses == 'has_expired':
        # Save the response to cache if successfull 
        courses = make_user_jwt_get_request(request, "{}/api/enrollment/v1/roles/".format(settings.BACKEND_LMS_BASE_URL))
        if courses.status_code == req_client.codes.ok:
            cache.set(user_email+'-'+settings.BACKEND_LMS_BASE_URL+"/api/enrollment/v1/roles/", courses.json(), 3600)
            courses = courses.json()
    return courses