const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');
const User = mongoose.model('User');

// Display all notifications on GET
exports.getNotifications = async (req, res) => {
  const user = await User.findById(req.params.id).populate({
    path: 'notifications',
    populate: { path: 'user' },
    options: { sort: { "_id": -1 } }
  });
  res.render('notifications/index', { notificationsList: user.notifications });
};

// Display detail page for a specific notification on GET
exports.showNotification = async (req, res) => {
  const notification = await Notification.findOneAndUpdate( { _id: req.params.notification_id }, { isRead: true }, { new: true });
  const route = notification.landscape ? `/landscapes/${notification.landscape}` : `/users/${notification.user}`;
  res.redirect(route);
};

// Get notifications no read
exports.getNotificacionsNotRead = async (user) => {
  if (!user) {
    return undefined;
  }
  const { notifications } = await User.findById(user._id).populate({
    path: 'notifications',
    populate: { path: 'user' },
    match: { isRead: false }
  }).exec();
  return notifications.reverse();
};