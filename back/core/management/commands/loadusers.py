from django.core.management.base import BaseCommand, no_translations
from core.tasks import load_users_from_api


class Command(BaseCommand):
    help = 'Loads users from lms'
    requires_migrations_checks = True

    @no_translations
    def handle(self, *args, **options):
        load_users_from_api()
