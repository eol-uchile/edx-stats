from visits.models import VisitOnPage
from rest_framework import serializers


class VisitOnPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitOnPage
        fields = '__all__'
