# uottahack-cloud-functions
This is the cloud functions backend for our app. To save time I wrote it entirely in javascript. It saves images to google buckets, and the links in the database. 

## About the app
The app was designed so you could take screenshots, have them uploaded to the cloud and have ml categorize the screenshots and assign labels to them using the google vision api. I did the backend portion and got it running on gcp functions so we could leave it up even after the hackathon. I did not taking into account that google sql is very expensive and did not leave it up. 

