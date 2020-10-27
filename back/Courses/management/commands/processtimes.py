from django.core.management.base import BaseCommand, no_translations
from Courses.tasks import compute_time_batches
from datetime import date

class Command(BaseCommand):
    help = 'Compute Student view times from logs on the db'
    requires_migrations_checks = True

    def add_arguments(self, parser):
        parser.add_argument('day-window', nargs=1, type=int,
                            help='Days to count from start date (default start date is today)')

        # Optional arguments
        parser.add_argument('--start', action='store',
                            help='Set start date as YYYY-MM-DD')

    @no_translations
    def handle(self, *args, **options):
        print(options)
        return
        if options['start'] is not None:
            compute_time_batches(options['start'],time_delta=options['day-window'][0])
        else:
            compute_time_batches(str(date.today()), time_delta=options['day-window'][0])
