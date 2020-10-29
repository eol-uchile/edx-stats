from .models import CourseVertical, Log
from rest_framework import serializers


class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'


class CourseVerticalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVertical
        fields = '__all__'
