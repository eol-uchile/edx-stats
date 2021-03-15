from django.db import models
from django.utils import timezone


class TimeOnPage(models.Model):
    event_type_vertical = models.TextField()
    sequential = models.TextField(blank=True)
    username = models.CharField(max_length=150)
    session = models.IntegerField()
    delta_time_float = models.FloatField()
    course = models.TextField()
    time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return "{} {} count: {}".format(self.time, self.vertical, self.count)
