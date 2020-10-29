from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters
from visits.models import VisitOnPage
from visits.serializers import VisitOnPageSerializer


class VisitOnPageViewSet(generics.ListAPIView, viewsets.ModelViewSet):
    """
    API that recovers a list of Visits per page
    """
    queryset = VisitOnPage.objects.all()
    serializer_class = VisitOnPageSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['username', 'time']
    filterset_fields = ['course']
