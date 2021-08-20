from django.contrib import admin
from views.models import Video, ViewOnVideo, Segment


class VideoAdmin(admin.ModelAdmin):
    search_fields = ['name', ]


class ViewAdmin(admin.ModelAdmin):
    search_fields = ['video__name', 'username' ]


class SegmentAdmin(admin.ModelAdmin):
    search_fields = ['view__username']


admin.site.register(Video, VideoAdmin)
admin.site.register(ViewOnVideo, ViewAdmin)
admin.site.register(Segment, SegmentAdmin)
