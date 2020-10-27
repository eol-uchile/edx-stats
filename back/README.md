# Analytics Backend

## Commands

The backend includes the following manage.py commands:
- loadlogs.py has two optional arguments
  - --dir: to use a different directory as log source
  - --non-zipped: to read non compressed files
  
  By default the command will read all the logs on the settings.py configuration.
  
  Example usage:
  - ```manage.py loadlogs```
- processtimes.py will read logs from an start date (today by default) and use a time window of X days to process student times until the start date. Optional arguments 
  - --start: set the start date with the format YYYY-MM-DD

  Example usage:
  - ```manage.py processtimes 3```
  - ```manage.py processtimes 3 --start 2019-03-01```