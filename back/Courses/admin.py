from django.contrib import admin
from Courses.models import Log, CourseVertical, TimeOnPage, StaffUserName, ProcessedRecord, LogFile

class LogAdmin(admin.ModelAdmin):
    pass

class CoursesAdmin(admin.ModelAdmin):
    pass

class TimesAdmin(admin.ModelAdmin):
    pass

class StaffUsernameAdmin(admin.ModelAdmin):
    pass

class ProcessedRecordAdmin(admin.ModelAdmin):
    pass

class LogFileAdmin(admin.ModelAdmin):
    pass

admin.site.register(Log, LogAdmin)
admin.site.register(CourseVertical, CoursesAdmin)
admin.site.register(TimeOnPage, TimesAdmin)
admin.site.register(StaffUserName, StaffUsernameAdmin)
admin.site.register(ProcessedRecord, ProcessedRecordAdmin)
admin.site.register(LogFile, LogFileAdmin)