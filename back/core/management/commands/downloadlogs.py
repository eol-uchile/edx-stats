import boto3
import logging
import datetime

from django.core.management.base import BaseCommand, no_translations
from django.conf import settings
from core.models import LogFile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Recover logs from the configured s3 bucket and any file which \
    path contains "logrotate".'
    requires_migrations_checks = True

    def add_arguments(self, parser):
        # Optional arguments
        parser.add_argument('--check-exists', action='store_true',
                            help='Verify if file was downloaded before.')
        parser.add_argument('--bucket',
                            help='Use a particular bucket.')
        parser.add_argument('--prefix',
                            help='Prefix directory for bucket.')
        parser.add_argument('--from-date',
                            help='Download tracking logs from initial date. Format YYYY-MM-DD')
        parser.add_argument('--load-all', action="store_true",
                            help='Load all logs available regarless of date and processing.')

    def get_date_from_timestamp(self, date_string, dash=False):
        if date_string is None:
            return None
        if dash:
            return datetime.date(int(date_string[:4]), int(date_string[5:7]), int(date_string[8:]))
        return datetime.date(int(date_string[:4]), int(date_string[4:6]), int(date_string[6:8]))

    def recover_and_save(self, client, check=False):

        if self.continuationToken is not None:
            file_batch = client.list_objects_v2(
                Bucket=self.bucket, Prefix=self.prefix, MaxKeys=1000, ContinuationToken=self.continuationToken)
        else:
            file_batch = client.list_objects_v2(
                Bucket=self.bucket, Prefix=self.prefix, MaxKeys=1000)

        keys = [k["Key"] for k in file_batch["Contents"]]

        for key in keys:

            # Skip on date (.log-YYYYMMDD)
            key_date_str = key[key.find(".log")+5: key.find(".log")+13]
            try:
                key_date = self.get_date_from_timestamp(key_date_str)
            except Exception:
                logger.warning(
                    "Tried to download file without date format: {}".format(key), exc_info=True)
                continue

            if self.skip_checks and (self.init_date is not None and key_date < self.init_date):
                logger.info(
                    "Skipping file on date restrictions: {}".format(key))
                continue

            # Recover and save file to logs
            try:
                file_out_path = "{}/{}".format(
                    settings.BACKEND_LOGS_DIR, key.replace("/", "-"))
                log_file = LogFile.objects.filter(file_name=file_out_path)

                if (check and log_file.count() > 0) and not self.skip_checks:
                    logger.info(
                        "Skipping file previously processed with key {}".format(key))
                    continue

                recovered_file = client.get_object(
                    Bucket=self.bucket,
                    Key=key,
                )

                with open(file_out_path, "wb") as f:
                    f.write(recovered_file["Body"].read())
                    logger.info("Recovered file with key {}".format(key))
            except Exception:
                logger.error("Error recovering key {}".format(
                    key), exc_info=True)

        if file_batch["IsTruncated"]:
            self.continuationToken = file_batch["NextContinuationToken"]
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
        
        self.init_date = self.get_date_from_timestamp(options["from_date"],dash=True)
        self.prefix = options["prefix"] if options["prefix"] is not None else "logrotate"
        self.skip_checks = options["load_all"] is not None
        self.bucket = settings.AWS_STORAGE_BUCKET_NAME if options[
            "bucket"] is None else options["bucket"]

        if self.bucket not in buckets:
            raise Exception(
                "Configured S3 bucket is not available on your S3!")

        self.continuationToken = None

        while self.recover_and_save(s3, check=options["check_exists"]):
            logger.info("Response was truncated, loading more ...")

        logger.info("Download complete :)")
