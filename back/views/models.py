from django.db import models
from django.utils import timezone


class Video(models.Model):
    vertical = models.ForeignKey(
        to='core.CourseVertical',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    block_id = models.CharField(max_length=100)
    duration = models.FloatField()
    watch_time = models.FloatField()

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

    def __str__(self):
        return "{} {}".format(self.video, self.username)


class SegmentManager(models.Manager):
    def bulk_create(self, objs, **kwargs):
        for obj in objs:
            try:
                obj.view.video.watch_time += (obj.end - obj.start)
                obj.view.video.save()
            except AttributeError:
                raise Exception("SegmentManager Bulk Create Error")
        return super().bulk_create(objs, **kwargs)


class SegmentQuerySet(models.QuerySet):
    def delete(self, *args, **kwargs):
        delta_delete = {}
        for obj in self:
            try:
                if(obj.view.video in delta_delete):
                    delta_delete[obj.view.video] += (obj.end - obj.start)
                else:
                    delta_delete[obj.view.video] = (obj.end - obj.start)
            except AttributeError:
                raise Exception("SegmentQuerySet Delete Error")
        for video in delta_delete.keys():
            try:
                video.watch_time -= delta_delete[video]
                video.save()
            except AttributeError:
                raise Exception("SegmentQuerySet Delete Error")
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
    start = models.FloatField()
    end = models.FloatField()

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
            raise Exception("Segment Save Error")
        super(Segment, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        try:
            self.view.video.watch_time -= (self.end - self.start)
            self.view.video.save()
        except AttributeError:
            raise Exception("Segment Delete Error")
        super(Segment, self).delete(*args, **kwargs)

    def __str__(self):
        return "{} {} {}-{}".format(self.view, self.time, self.start, self.end)
