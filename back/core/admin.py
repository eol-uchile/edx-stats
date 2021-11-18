from django.contrib import admin
from core.models import Log, CourseVertical, StaffUserName, LogFile, Student


class LogAdmin(admin.ModelAdmin):
    show_full_result_count = False


class CoursesAdmin(admin.ModelAdmin):
    pass


class StaffUsernameAdmin(admin.ModelAdmin):
    pass


class StudentAdmin(admin.ModelAdmin):
    search_fields = ('username', 'name', 'email', 'country')
    list_display = ('username','name','email', 'date_joined', 'last_update')
    ordering = ['-last_update']


class LogFileAdmin(admin.ModelAdmin):
    pass


admin.site.register(Log, LogAdmin)
admin.site.register(CourseVertical, CoursesAdmin)
admin.site.register(StaffUserName, StaffUsernameAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(LogFile, LogFileAdmin)
