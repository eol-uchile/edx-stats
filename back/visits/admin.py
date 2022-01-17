from django.contrib import admin
from visits.models import VisitOnPage, CompletionOnBlock


class VisitsAdmin(admin.ModelAdmin):
    pass

class CompletionsAdmin(admin.ModelAdmin):
    pass


admin.site.register(VisitOnPage, VisitsAdmin)
admin.site.register(CompletionOnBlock, CompletionsAdmin)
