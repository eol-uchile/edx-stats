# Backend Documentation

## Dataflow and tasks
The data from a course is fetched from the filesystem using Celery cron tasks. This processes the logs and saves different metrics like sessions, course structure, etc to the Django DB.

The diagram shows the basic flow of information on the backend app:

![Dataflow and requests](StatsDataFlow-Page-2.png)

### Course Structure
More in detail, after loading the logs corresponding to a particular course, the course components (represented by *CourseVertical*) are inactivated, i.e. they change their *is_active* field to false. The purpose is to distinguish and filter the statistics associated with recent content that is still being displayed in the course.
After that, new components are saved and existing ones are updated.

Once a request arrives it passes through the middlewares and checks:
* Presence of the USE-JWT-COOKIE HTTP header.
* Both header-payload and sign cookies
* Recovers the JWT Token and decodes it
* Recovers the user from the JWT payload
* Goes to the particular view

Some views must check that the current user has permissions over the data. This is already checked client-side but acts as a failsafe to ensure the user has access only to the courses where it has some authority, i.e. a student shouldn't be able to asks for its peers information. This check is done by forwarding a request from the view, caching the response and checking permissions. 

Note: To send the request from a view we have to remove the recovered cookie.

### Statistics

Loading logs and computing user page times statistic.
![Dataflow and requests](StatsDataFlow-Page-3.png)

Data logs are fetched from the filesystem and it is processed for general purpose analysis. Then another tasks (like tasks 2) recovers the info, ask for complementary data at the LMS API and processes times saving them to the database.

The info retrieval process is selective according to the desired statistic (*TimeOnPage, VisitOnPage* or *ViewOnVideo*). For example, the *ViewOnVideo* statistic will load only the logs related to videos, such as the play_video and stop_video events.

In the specific case of this metric, during its creation process the *Video* and *Segment* tables are also created. When a new video *Segment* is created/modified/deleted, the *Video* viewed modifies its *watch_time* field automatically. Conversely, to update the *coverage* field of the videos of a course, it is necessary to call *processcoverage* task.
