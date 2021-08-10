from django.db import models
from django.utils import timezone


class VisitOnPage(models.Model):
    vertical = models.ForeignKey(
        to = 'core.CourseVertical',
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        )
    ### deprecated ###
    sequential = models.TextField(blank=True)
    chapter = models.TextField(blank=True)
    course = models.TextField()
    ##################
    username = models.CharField(max_length=150)
    count = models.IntegerField()
    time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return "{} - {} count: {}".format(self.time, self.vertical, self.count)
