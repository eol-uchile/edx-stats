import boto3
import logging

from django.core.management.base import BaseCommand, no_translations
from django.conf import settings
from botocore.exceptions import ClientError
from core.tasks import load_logs
from core.models import LogFile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Recover logs from configured s3 bucket'
    requires_migrations_checks = True

    def add_arguments(self, parser):
        # Optional arguments
        parser.add_argument('--check-exists', action='store_true',
                            help='Verify if file was downloaded before.')

    def recover_and_save(self, client, check=False):
        file_batch = client.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME)

        keys = [k["Key"] for k in file_batch["Contents"]]

        for key in keys:
            # Only process log directories
            if "log" not in key:
                continue
            # Recover and save file to logs
            try:
                file_out_path = "{}/{}".format(
                    settings.BACKEND_LOGS_DIR, key.replace("/", "-"))
                log_file = LogFile.objects.filter(file_name=file_out_path)

                if check and log_file.count() > 0:
                    logger.info(
                        "Skipping file previously processed with key {}".format(key))
                    continue

                recovered_file = client.get_object(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    Key=key,
                )

                with open(file_out_path, "wb") as f:
                    f.write(recovered_file["Body"].read())
                    logger.info("Recovered file with key {}".format(key))
            except Exception:
                logger.error("Error recovering key {}".format(
                    key), exc_info=True)
        return file_batch["IsTruncated"]

    @no_translations
    def handle(self, *args, **options):

        if not hasattr(settings, "AWS_STORAGE_BUCKET_NAME"):
            raise Exception(
                "No S3 bucket configured, check your YAML configuration!")

        s3 = boto3.client('s3',
                          endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                          aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                          )

        bucket_response = s3.list_buckets()
        buckets = [b["Name"] for b in bucket_response["Buckets"]]
        if settings.AWS_STORAGE_BUCKET_NAME not in buckets:
            raise Exception(
                "Configured S3 bucket is not available on your S3!")

        while self.recover_and_save(s3, options["check_exists"]):
            continue

        logger.info("Finishing operation")
