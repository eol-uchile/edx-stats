from django.db import models
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class Video(models.Model):
    vertical = models.ForeignKey(
        to='core.CourseVertical',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    block_id = models.CharField(max_length=100)
    duration = models.IntegerField()
    watch_time = models.IntegerField()

    def __str__(self):
        return self.block_id

class ViewOnVideo(models.Model):
    video = models.ForeignKey(
        to=Video,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    username = models.CharField(max_length=150)
    coverage = models.FloatField()

    def __str__(self):
        return "{} {}".format(self.video, self.username)


class SegmentManager(models.Manager):
    def bulk_create(self, objs, **kwargs):
        unreferenced_segments = 0
        for obj in objs:
            try:
                obj.view.video.watch_time += (obj.end - obj.start)
                obj.view.video.save()
            except AttributeError:
                unreferenced_segments+=1
        if(unreferenced_segments>0):
            logger.info("Failed to increase time watched on videos for {} segments".format(unreferenced_segments))
        return super().bulk_create(objs, **kwargs)


class SegmentQuerySet(models.QuerySet):
    def delete(self, *args, **kwargs):
        unreferenced_segments = 0
        delta_delete = {}
        for obj in self:
            try:
                if(obj.view.video in delta_delete):
                    delta_delete[obj.view.video] += (obj.end - obj.start)
                else:
                    delta_delete[obj.view.video] = (obj.end - obj.start)
            except AttributeError:
                unreferenced_segments+=1
        if(unreferenced_segments>0):
            logger.info("Failed to decrease time watched on videos for {} segments".format(unreferenced_segments))
        for video in delta_delete.keys():
            video.watch_time -= delta_delete[video]
            video.save()
        super(SegmentQuerySet, self).delete(*args, **kwargs)


class Segment(models.Model):
    objects = SegmentManager.from_queryset(SegmentQuerySet)()
    view = models.ForeignKey(
        to=ViewOnVideo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    time = models.DateTimeField(default=timezone.now)
    start = models.IntegerField()
    end = models.IntegerField()

    def save(self, *args, **kwargs):
        try:
            if self.pk:
                old_instance = Segment.objects.get(pk=self.pk)
                old_instance.view.video.watch_time -= (
                    old_instance.end - old_instance.start)
                old_instance.view.video.save()
            self.view.video.watch_time += (self.end - self.start)
            self.view.video.save()
        except AttributeError:
            logger.warning("Segment: save Error")
        super(Segment, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        try:
            self.view.video.watch_time -= (self.end - self.start)
            self.view.video.save()
        except AttributeError:
            logger.warning("Segment: delete Error")
        super(Segment, self).delete(*args, **kwargs)

    def __str__(self):
        return "{} {} {}-{}".format(self.view, self.time, self.start, self.end)
