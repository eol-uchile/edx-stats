from django.contrib import admin
from Courses.models import Log, CourseVertical, TimeOnPage

class LogAdmin(admin.ModelAdmin):
    pass

class CoursesAdmin(admin.ModelAdmin):
    pass

class TimesAdmin(admin.ModelAdmin):
    pass

admin.site.register(Log, LogAdmin)
admin.site.register(CourseVertical, CoursesAdmin)
admin.site.register(TimeOnPage, TimesAdmin)
