from django.db import models
from django.utils import timezone

class Video(models.Model):
    vertical = models.ForeignKey(
        to = 'core.CourseVertical',
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
    )
    name = models.CharField(max_length=100)
    duration = models.IntegerField()
    watch_time = models.IntegerField()

    def __str__(self):
        return self.name

class ViewOnVideo(models.Model):
    video = models.ForeignKey(
        to = Video,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
    )
    username = models.CharField(max_length=150)

    def __str__(self):
        return "{} {}".format(self.video.name, self.username)

class Segment(models.Model):
    view = models.ForeignKey(
        to = ViewOnVideo,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
    )
    time = models.DateTimeField(default=timezone.now)
    start = models.IntegerField()
    end = models.IntegerField()

    def __str__(self):
        return "{} {} {}-{}".format(self.view, self.time, self.start, self.end)

