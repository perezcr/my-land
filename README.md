# MyLand

> Website written in Express (Node.js) using MVC Pattern 🔥

## Live Demo

Check out the [live application here.](https://mylandweb.herokuapp.com/)

## Covered Concepts

|User Accounts|Database Schemas|Templating EJS|
| :---: | :---: | :---: |
|Middleware|Password Reset Flow|Routing|
|Error Handling|File Uploading|MVC Pattern|
|REST API endpoints|Document Relationships|Restricting Operations|
|Storing Geospatial Data|Sending Email|Geocoding Addresses|

## Features

* Done with ES6 Features 🔥 Async/Await, Arrow functions, etc.

* Authentication:

	* User login with email and password

	* User login with your Facebook account

	* User login with your Google account

	* Admin sign-up with admin code

* Authorization:

  * One cannot manage posts and view user profile without being authenticated

  * One cannot edit or delete posts and comments created by other users

  * Admin can manage all posts and comments

* Manage landscapes posts with basic functionalities:

  * Create, edit and delete posts (CRUD)

  * Comments (CRUD)

  * Ratings and Reviews (CRUD)

  * Upload landscapes photos with multer and cloudinary 

  * Display landscape location on Mapbox

* In-app Notifications

* Manage user account with basic functionalities:

  * Password reset via email confirmation and profile page

  * Profile page setup with sign-up

* Flash messages responding to user's interaction with the app

* Responsive web design

### Custom Enhancements

* Update personal information on profile page

* Improve image load time on the landing page using Cloudinary

* Use Helmet to strengthen security

## Getting Started

> This app contains API secrets and passwords that have been hidden deliberately, so the app cannot be run with its features on your local machine.

## Download and install dependencies

```bash
npm install
```

## Sample Data

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

That will populate 8 landscapes, 3 users, 20 comments, 16 reviews and 24 notifications. The logins for the authors are as follows:

|Username|Email (login)|Password|
|---|---|---|
|Cristian|cristian@example.com|cristian|
|Camilo|camilo@example.com|camilo|
|Perez|perez@example.com|perez|

### Comments in Code

Some comments in the source code are course notes and therefore might not seem necessary from a developer's point of view.

## Built with

### Front-end

* [ejs](http://ejs.co/)
* [Mapbox APIs](https://www.mapbox.com/)
* [Bootstrap 4](https://getbootstrap.com/)

### Back-end

* [express](https://expressjs.com/)
* [mongoDB](https://www.mongodb.com/)
* [mongoose](http://mongoosejs.com/)
* [helmet](https://helmetjs.github.io/)
* [compression](https://github.com/expressjs/compression)
* [passport](http://www.passportjs.org/)
* [passport-local](https://github.com/jaredhanson/passport-local#passport-local)
* [passport-local-mongoose](https://github.com/saintedlama/passport-local-mongoose)
* [passport-facebook](https://github.com/jaredhanson/passport-facebook)
* [passport-google-oauth20](https://github.com/mstade/passport-google-oauth2)
* [express-session](https://github.com/expressjs/session#express-session)
* [method-override](https://github.com/expressjs/method-override#method-override)
* [nodemailer](https://nodemailer.com/about/)
* [moment](https://momentjs.com/)
* [connect-flash](https://github.com/jaredhanson/connect-flash#connect-flash)
* [cloudinary](https://cloudinary.com/)

### Platforms

* [Cloudinary](https://cloudinary.com/)
* [Heroku](https://www.heroku.com/)

## License

#### [MIT](./LICENSE)
