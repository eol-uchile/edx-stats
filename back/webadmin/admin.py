from django.contrib import admin
from webadmin.models import Announcement


class AnnouncementAdmin(admin.ModelAdmin):
    pass


admin.site.register(Announcement, AnnouncementAdmin)
