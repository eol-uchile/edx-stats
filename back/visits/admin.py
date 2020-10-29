from django.contrib import admin
from visits.models import VisitOnPage


class VisitsAdmin(admin.ModelAdmin):
    pass


admin.site.register(VisitOnPage, VisitsAdmin)
