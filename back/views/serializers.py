from rest_framework import serializers
from views.models import Video
from core.serializers import NestedCourseVerticalSerializer

class VideoSerializer(serializers.ModelSerializer):
    vertical = NestedCourseVerticalSerializer(many=False)
    class Meta:
        model = Video
        fields = ('vertical', 'block_id')