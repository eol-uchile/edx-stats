from datetime import timedelta
from django.core.management.base import BaseCommand, no_translations
from visits.tasks import compute_time_batches


class Command(BaseCommand):
    help = 'Compute visit counts from logs on the db from a start date until today.'
    requires_migrations_checks = True

    def add_arguments(self, parser):
        parser.add_argument('start', action='store',
                            help='Set start date as YYYY-MM-DD')

        # Optional arguments
        parser.add_argument('--day-step', nargs=1, type=int,
                            help='Days loaded into memory (default is 3)')

    @no_translations
    def handle(self, *args, **options):
        if options['day_step'] is not None:
            compute_time_batches(options['start'], time_delta=timedelta(
                days=options['day_step'][0]))
        else:
            compute_time_batches(options['start'])
