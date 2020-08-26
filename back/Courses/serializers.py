from .models import CourseVertical, Log, TimeOnPage
from rest_framework import serializers

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'

class CourseVerticalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVertical
        fields = '__all__'

class TimeOnPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeOnPage
        fields = '__all__'