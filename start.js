const mongoose = require('mongoose');

// Import environmental variables from our variables.env file
require('dotenv').config();

// Set up mongoose connection
mongoose.connect(process.env.MONGODB_URL, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false });
mongoose.connection.on('error', (err) => {
  console.error(`🚫 → ${err.message}`);
});

// Import all of our models
require('./models/User');
require('./models/Notification');
require('./models/Review');
require('./models/Comment');
require('./models/Landscape');

// Start our app!
const app = require('./app');

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => { 
  console.log(`Express running → PORT ${server.address().port} 🔥`);
});