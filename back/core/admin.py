from django.contrib import admin
from core.models import Log, CourseVertical, StaffUserName, LogFile


class LogAdmin(admin.ModelAdmin):
    show_full_result_count = False


class CoursesAdmin(admin.ModelAdmin):
    pass


class StaffUsernameAdmin(admin.ModelAdmin):
    pass


class LogFileAdmin(admin.ModelAdmin):
    pass


admin.site.register(Log, LogAdmin)
admin.site.register(CourseVertical, CoursesAdmin)
admin.site.register(StaffUserName, StaffUsernameAdmin)
admin.site.register(LogFile, LogFileAdmin)
