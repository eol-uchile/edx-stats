from times.models import TimeOnPage
from rest_framework import serializers

class TimeOnPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeOnPage
        fields = '__all__'