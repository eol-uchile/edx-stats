from django.core.management.base import BaseCommand, no_translations
from Courses.tasks import load_logs, load_course_from_api, process_log_times_from_dir

class Command(BaseCommand):
    help = 'Loads logs from files into the db'
    requires_migrations_checks = True

    def add_arguments(self, parser):
        parser.add_argument('course_log', nargs=1, type=str)
        parser.add_argument('course_structure', nargs=1, type=str)

    @no_translations
    def handle(self, *args, **options):
        load_course_from_api(options['course_structure'])
        load_logs(options['course_log'])
        process_log_times_from_dir(options['course_log'] , options['course_structure'])
