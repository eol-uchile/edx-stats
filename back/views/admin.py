from django.contrib import admin
from views.models import Video, ViewOnVideo, Segment


class VideoAdmin(admin.ModelAdmin):
    search_fields = ['block_id', ]
    list_display = ('block_id', 'duration', 'watch_time')


class ViewOnVideoAdmin(admin.ModelAdmin):
    search_fields = ['video__block_id', 'username']
    list_display = ('username', 'video')


class SegmentAdmin(admin.ModelAdmin):
    search_fields = ['view__video__block_id', 'view__username']
    list_display = ('get_user', 'get_video', 'start', 'end')

    def get_user(self, obj):
        if(obj.view):
            return obj.view.username
        return '-'
    get_user.short_description = 'Username'
    get_user.admin_order_field = 'view__username'

    def get_video(self, obj):
        if(obj.view):
            if(obj.view.video):
                return obj.view.video.block_id
        return '-'
    get_video.short_description = 'Video ID'
    get_video.admin_order_field = 'view__video__block_id'


admin.site.register(Video, VideoAdmin)
admin.site.register(ViewOnVideo, ViewOnVideoAdmin)
admin.site.register(Segment, SegmentAdmin)
