# Generated by Django 2.2.16 on 2021-10-22 15:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_coursevertical_is_active'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='coursevertical',
            index=models.Index(fields=['course'], name='core_course_course_fd6eae_idx'),
        ),
    ]
