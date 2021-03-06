# Generated by Django 2.2.16 on 2020-10-29 20:55

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CourseVertical',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course', models.TextField()),
                ('course_name', models.CharField(max_length=255)),
                ('chapter', models.TextField()),
                ('chapter_name', models.CharField(max_length=255)),
                ('sequential', models.TextField()),
                ('sequential_name', models.CharField(max_length=255)),
                ('vertical', models.TextField()),
                ('vertical_name', models.CharField(max_length=255)),
                ('block_id', models.TextField()),
                ('vertical_number', models.IntegerField()),
                ('sequential_number', models.IntegerField()),
                ('chapter_number', models.IntegerField()),
                ('child_number', models.IntegerField()),
                ('block_type', models.TextField()),
                ('student_view_url', models.TextField()),
                ('lms_web_url', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Log',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=150)),
                ('event_source', models.CharField(max_length=10)),
                ('name', models.TextField(blank=True, null=True)),
                ('accept_language', models.TextField()),
                ('ip', models.CharField(max_length=15)),
                ('agent', models.TextField()),
                ('page', models.TextField(blank=True, null=True)),
                ('host', models.CharField(max_length=255)),
                ('session', models.CharField(max_length=64)),
                ('referer', models.TextField()),
                ('time', models.DateTimeField()),
                ('event', models.TextField()),
                ('event_type', models.TextField()),
                ('course_id', models.TextField(blank=True)),
                ('org_id', models.CharField(blank=True, max_length=255)),
                ('user_id', models.IntegerField(blank=True)),
                ('path', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='LogFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_name', models.CharField(max_length=50)),
                ('processed_on', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='StaffUserName',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=150)),
            ],
        ),
    ]
