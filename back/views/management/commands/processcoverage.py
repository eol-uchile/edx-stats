from django.core.management.base import BaseCommand, no_translations
from views.tasks import compute_video_coverage


class Command(BaseCommand):
    help = 'Compute Student coverage on videos. \
        It can process a single course if given the id.'

    requires_migrations_checks = True

    def add_arguments(self, parser):
        # Optional arguments
        parser.add_argument('--course-id', nargs=1, type=str,
                            help='Process a course')

    @no_translations
    def handle(self, *args, **options):
        course = None
        if options['course_id'] is not None:
            course = options['course_id'][0]
        compute_video_coverage(course=course)
