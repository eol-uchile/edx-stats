# Generated by Django 2.2.16 on 2020-10-09 15:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Courses', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='log',
            name='host',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='log',
            name='org_id',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='log',
            name='session',
            field=models.CharField(max_length=64),
        ),
        migrations.AlterField(
            model_name='log',
            name='username',
            field=models.CharField(max_length=150),
        ),
    ]