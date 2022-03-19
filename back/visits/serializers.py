from rest_framework import serializers
from visits.models import VisitOnPage, CompletionOnBlock


class VisitOnPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitOnPage
        fields = '__all__'

class CompletionOnBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletionOnBlock
        fields = '__all__'
