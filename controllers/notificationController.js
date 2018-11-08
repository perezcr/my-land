const Notification  = require('../models/notification');
const User          = require('../models/user');

// Display all notifications on GET
exports.notificationIndex = async function(req, res){
  try {
    let user = await User.findById(req.params.id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let notificationsList = user.notifications;
    res.render('notifications/index', { notificationsList });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
};

// Display detail page for a specific notification on GET
exports.notificationShow = async function(req, res){
  try {
    let notification = await Notification.findById(req.params.notification_id);
    notification.isRead = true;
    notification.save();
    const route = notification.landscapeId ? `/landscapes/${notification.landscapeId}` : `/users/${notification.userId}`;
    res.redirect(route);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
};