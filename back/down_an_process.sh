#!/bin/bash

run(){
  python manage.py downloadlogs --prefix logrotate --from-date "$1" --check-exists
  python manage.py loadlogs
  python manage.py processtimes "$1" --day-step 2
  python manage.py processvisits "$1" --day-step 2
  python manage.py processviews "$1" --day-step 2
  python manage.py processcoverage
}

if [[ ! -z $1 ]]; then
  run $1
else
  echo "Expected date in format YYYY-MM-DD as first argument" 1>&2;
  echo "Using default of 3 days ago...";
  sleep 3 
  run $(date -d "3 day ago" +%Y-%m-%d)
fi