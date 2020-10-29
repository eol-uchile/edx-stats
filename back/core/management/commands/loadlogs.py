from django.core.management.base import BaseCommand, no_translations
from core.tasks import load_logs


class Command(BaseCommand):
    help = 'Loads logs from configured directory into the db'
    requires_migrations_checks = True

    def add_arguments(self, parser):
        # Optional arguments
        parser.add_argument('--dir', action='store', nargs='?',
                            help='Use a directory (with full path) to load logs')
        parser.add_argument('--non-zipped', action='store_true',
                            help='Expect plain text instead of .gz')

    @no_translations
    def handle(self, *args, **options):
        if options['non_zipped']:
            zipped = False
        else:
            zipped = True
        if options['dir'] is not None:
            load_logs(options['dir'], zipped=zipped)
        else:
            load_logs(zipped=zipped)
