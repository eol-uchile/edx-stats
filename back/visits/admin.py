from django.contrib import admin
from visits.models import VisitOnPage


class VisitsAdmin(admin.ModelAdmin):
    search_fields = ['vertical__course', 'vertical__course_name',
        'vertical__chapter', 'vertical__chapter_name',
        'vertical__sequential', 'vertical__sequential_name',
        'vertical__vertical', 'vertical__vertical_name',
        'vertical__block_id', 'username']
    list_display = ('get_block_id', 'username', 'count')

    def get_block_id(self, obj):
        if(obj.vertical):
            return obj.vertical.block_id
        return '-'
    get_block_id.short_description = 'Block ID'
    get_block_id.admin_order_field = 'vertical__block_id'


admin.site.register(VisitOnPage, VisitsAdmin)
