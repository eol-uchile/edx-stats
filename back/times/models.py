from django.db import models
from django.utils import timezone


class TimeOnPage(models.Model):
    vertical = models.ForeignKey(
        to = 'core.CourseVertical',
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
    )
    session = models.IntegerField()
    username = models.CharField(max_length=150)
    delta_time_float = models.FloatField()
    time = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return "{} {}".format(self.vertical, self.username)
