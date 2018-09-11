# MyLand

> Website written in Express (Node.js) using MVC Architecture.

## Live Demo

To see the app in action, go to [https://yelpcamp--demo.herokuapp.com/](https://mylandweb.herokuapp.com/)

## Features

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

  * Create, edit and delete posts and comments

  * Upload landscapes photos

  * Display landscape location on Mapbox

* Manage user account with basic functionalities:

  * Password reset via email confirmation and profile page

  * Profile page setup with sign-up

* Flash messages responding to users' interaction with the app

* Responsive web design

### Custom Enhancements

* Update personal information on profile page

* Use Helmet to strengthen security

## Getting Started

> This app contains API secrets and passwords that have been hidden deliberately, so the app cannot be run with its features on your local machine.

### Comments in code

Some comments in the source code are course notes and therefore might not seem necessary from a developer's point of view.

## Built with

### Front-end

* [ejs](http://ejs.co/)
* [Mapbox APIs](https://www.mapbox.com/)
* [Bootstrap](https://getbootstrap.com/docs/3.3/)

### Back-end

* [express](https://expressjs.com/)
* [mongoDB](https://www.mongodb.com/)
* [mongoose](http://mongoosejs.com/)
* [async](http://caolan.github.io/async/)
* [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme)
* [helmet](https://helmetjs.github.io/)
* [compression](https://github.com/expressjs/compression)
* [passport](http://www.passportjs.org/)
* [passport-local](https://github.com/jaredhanson/passport-local#passport-local)
* [passport-facebook](https://github.com/jaredhanson/passport-facebook)
* [passport-google-oauth20](https://github.com/mstade/passport-google-oauth2)
* [express-session](https://github.com/expressjs/session#express-session)
* [method-override](https://github.com/expressjs/method-override#method-override)
* [nodemailer](https://nodemailer.com/about/)
* [moment](https://momentjs.com/)
* [geocoder](https://github.com/wyattdanger/geocoder#geocoder)
* [connect-flash](https://github.com/jaredhanson/connect-flash#connect-flash)

### Platforms

* [Heroku](https://www.heroku.com/)

## License

#### [MIT](./LICENSE)
