#!/bin/bash
if [[ ! -z $1 ]]; then
  echo $1
  python manage.py downloadlogs --prefix logrotate --from-date "$1" --check-exists
  python manage.py loadlogs
  python manage.py processtimes "$1"
  python manage.py processvisits "$1"
else
  echo "Fatal Error: date argument unset!" 1>&2;
  echo "Expected date in format YYYY-MM-DD as first argument";
fi