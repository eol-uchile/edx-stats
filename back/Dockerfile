FROM python:3 as dev
ENV PYTHONUNBUFFERED 1
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
#RUN python /app/manage.py collectstatic --noinput
#RUN python /app/manage.py makemigrations
#RUN python /app/manage.py migrate
CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "Stats.wsgi:application"]