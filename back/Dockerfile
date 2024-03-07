FROM python:3.8.6 as dev
ENV PYTHONUNBUFFERED 1
ENV DJANGO_DEBUG True
ENV CONFIG_FILE  /app/production.yml
RUN mkdir /app
WORKDIR /app
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY . /app/

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# PRODUCTION IMAGE LAYER (docker-compose variables are necessary as db)
FROM dev as prod
# Add gunicorn 
RUN pip install gunicorn==19.9.0
ENV DJANGO_DEBUG False
ENV CONFIG_FILE  /app/production.yml
RUN python /app/manage.py collectstatic --noinput
#RUN python /app/manage.py makemigrations
#RUN python /app/manage.py migrate
CMD ["gunicorn", "Stats.wsgi:application", "-c", "gunicorn.conf.py"]