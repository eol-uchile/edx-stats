from django.contrib import admin
from times.models import TimeOnPage

class TimesAdmin(admin.ModelAdmin):
    pass

admin.site.register(TimeOnPage, TimesAdmin)
