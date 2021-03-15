from datetime import timedelta
from django.core.management.base import BaseCommand, no_translations
from times.tasks import compute_time_batches


class Command(BaseCommand):
    help = 'Compute Student view times from logs on the db from a start date until today. \
        You can also provide an optional end date. \
        It can process a single course if given the id.'

    requires_migrations_checks = True

    def add_arguments(self, parser):
        parser.add_argument('start', action='store',
                            help='Set start date as YYYY-MM-DD')

        # Optional arguments
        parser.add_argument('--day-step', nargs=1, type=int,
                            help='Days loaded into memory (default is 3)')

        parser.add_argument('--end-date', nargs=1, type=str,
                            help='Set end date as YYYY-MM-DD')

        parser.add_argument('--course-id', nargs=1, type=str,
                            help='Process a course')

    @no_translations
    def handle(self, *args, **options):
        final_date = None
        if options['end_date'] is not None:
            final_date = options['end_date'][0]

        course = None
        if options['course_id'] is not None:
            course = options['course_id'][0]

        if options['day_step'] is not None:
            compute_time_batches(options['start'], time_delta=timedelta(
                days=options['day_step'][0]), final_date=final_date, course=course)
        else:
            compute_time_batches(
                options['start'], final_date=final_date, course=course)
