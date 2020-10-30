from rest_framework import serializers
from times.models import TimeOnPage


class TimeOnPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeOnPage
        fields = '__all__'
