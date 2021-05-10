# Generated by Django 2.2.16 on 2021-03-22 17:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webadmin', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='announcement',
            name='dismissable',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='announcement',
            name='title',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]