from django.contrib import admin
from core.models import Log, CourseVertical, StaffUserName, LogFile


class LogAdmin(admin.ModelAdmin):
    show_full_result_count = False
    search_fields = ['event_type', ]


class CoursesAdmin(admin.ModelAdmin):
    search_fields = ['block_id', 'block_type']


class StaffUsernameAdmin(admin.ModelAdmin):
    pass


class LogFileAdmin(admin.ModelAdmin):
    pass


admin.site.register(Log, LogAdmin)
admin.site.register(CourseVertical, CoursesAdmin)
admin.site.register(StaffUserName, StaffUsernameAdmin)
admin.site.register(LogFile, LogFileAdmin)
