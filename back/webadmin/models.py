from django.db import models
from django.utils import timezone


class Announcement(models.Model):

    class Meta:
        ordering = ["created_at"]

    ALERT_VARIANTS = [
        ('primary', 'primary'),
        ('secondary', 'secondary'),
        ('success', 'success'),
        ('danger', 'danger'),
        ('warning', 'warning'),
        ('info', 'info'),
        ('light', 'light'),
        ('dark', 'dark'),
    ]

    published = models.BooleanField(default=False)
    variant = models.CharField(
        max_length=9, choices=ALERT_VARIANTS, default="primary")
    message = models.TextField(null=False, blank=False)
    created_at = models.DateTimeField(default=timezone.now)
    title = models.CharField(max_length=100, blank=True)
    dismissable = models.BooleanField(default=True)

    def __str__(self):
        return "{} {} published: {}".format(self.created_at, self.title, self.published)
