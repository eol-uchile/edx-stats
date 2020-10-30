from rest_framework import serializers
from visits.models import VisitOnPage


class VisitOnPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitOnPage
        fields = '__all__'
