from django.db import models
from django.utils import timezone

class SingletonModel(models.Model):

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SingletonModel, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class Log(models.Model):
    username = models.CharField(max_length=150)
    event_source = models.CharField(max_length=10)
    name = models.TextField(blank=True, null=True)
    accept_language = models.TextField()
    ip = models.CharField(max_length=15)
    agent = models.TextField()
    page = models.TextField(blank=True, null=True)
    host = models.CharField(max_length=255)
    session = models.CharField(max_length=64)
    referer = models.TextField()
    time = models.DateTimeField()
    event = models.TextField()
    event_type = models.TextField()
    course_id = models.TextField(blank=True)
    org_id = models.CharField(max_length=255, blank=True)
    user_id = models.IntegerField(blank=True,)
    path = models.TextField()


class CourseVertical(models.Model):
    course = models.TextField()
    course_name = models.CharField(max_length=255)
    chapter = models.TextField()
    chapter_name = models.CharField(max_length=255)
    sequential = models.TextField()
    sequential_name = models.CharField(max_length=255)
    vertical = models.TextField()
    vertical_name = models.CharField(max_length=255)
    block_id = models.TextField()
    vertical_number = models.IntegerField()
    sequential_number = models.IntegerField()
    chapter_number = models.IntegerField()
    child_number = models.IntegerField()
    block_type = models.TextField()
    student_view_url = models.TextField()
    lms_web_url = models.TextField()

class TimeOnPage(models.Model):
    event_type_vertical = models.TextField()
    username = models.CharField(max_length=150)
    session = models.IntegerField()
    delta_time_float = models.FloatField()
    course = models.TextField()
    time = models.DateTimeField(default=timezone.now)

class StaffUserName(models.Model):
    username = models.CharField(max_length=150)

class ProcessedRecord(SingletonModel):
    last_processed_time = models.ForeignKey(TimeOnPage, null=True, on_delete=models.SET_NULL)
    last_processed_time_timestamp = models.DateTimeField(blank=True, null=True)

class LogFile(models.Model):
    file_name = models.CharField(max_length=50)
    processed_on = models.DateTimeField(default=timezone.now)