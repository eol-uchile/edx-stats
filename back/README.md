# Analytics Backend

## Commands

The backend includes the following manage.py commands:
- loadlogs.py has two optional arguments
  - --dir: to use a different directory as log source
  - --non-zipped: to read non compressed files
  
  By default the command will read all the logs on the settings.py configuration.
  
  Example usage:
  - ```manage.py loadlogs```
- processtimes.py will read logs from an start date to today. Optional arguments 
  - --day-step: how many days to process in memory at a time

  Example usage:
  - ```manage.py processtimes 2019-03-23```
  - ```manage.py processtimes 2019-03-23 --day-step 4 ```

- processvisits.py counts the number from the navigation logs given a starting date.
Optional arguments 
  - --day-step: how many days to process in memory at a time

  Example usage:
  - ```manage.py processvisits 2019-03-23```
  - ```manage.py processvisits 2019-03-23 --day-step 4 ```
