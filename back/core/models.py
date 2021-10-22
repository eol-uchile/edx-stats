from django.db import models
from django.utils import timezone


class Log(models.Model):

    class Meta:
        indexes = [
            models.Index(fields=["course_id", "time"]),
            models.Index(fields=["id"]),
        ]

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
    user_id = models.IntegerField(blank=True)
    path = models.TextField()

    def __str__(self):
        return "User: {}, event type {}".format(self.username, self.event_type)


class LogFile(models.Model):
    file_name = models.CharField(max_length=50)
    processed_on = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.file_name


class CourseVertical(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=["course"]),
        ]
        
    is_active = models.BooleanField(default=True)
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
    block_type = models.CharField(max_length=100)
    student_view_url = models.TextField()
    lms_web_url = models.TextField()

    def __str__(self):
        return self.course+"."+self.vertical_name


class StaffUserName(models.Model):
    username = models.CharField(max_length=150)

    def __str__(self):
        return self.username
