import notificationModel from '../models/notificationModel.js';

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }
    
    const notifications = await notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, notifications });
    
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.json({ success: false, message: error.message });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { notificationId } = req.body;
    
    if (!userId || !notificationId) {
      return res.json({ success: false, message: 'User ID and Notification ID are required' });
    }
    
    const notification = await notificationModel.findOne({ 
      _id: notificationId, 
      userId 
    });
    
    if (!notification) {
      return res.json({ success: false, message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ success: true, message: 'Notification marked as read', notification });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }
    
    await notificationModel.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }
    
    const count = await notificationModel.countDocuments({ 
      userId, 
      read: false 
    });
    
    res.json({ success: true, count });
    
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get doctor notifications
const getDoctorNotifications = async (req, res) => {
  try {
    const docId = req.body.docId; // Get from middleware
    
    if (!docId) {
      return res.json({ success: false, message: 'Doctor ID is required' });
    }
    
    const notifications = await notificationModel
      .find({ userId: docId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, notifications });
    
  } catch (error) {
    console.error('Error getting doctor notifications:', error);
    res.json({ success: false, message: error.message });
  }
};

// Mark doctor notification as read
const markDoctorNotificationAsRead = async (req, res) => {
  try {
    const docId = req.body.docId;
    const { notificationId } = req.body;
    
    if (!docId || !notificationId) {
      return res.json({ success: false, message: 'Doctor ID and Notification ID are required' });
    }
    
    const notification = await notificationModel.findOne({ 
      _id: notificationId, 
      userId: docId 
    });
    
    if (!notification) {
      return res.json({ success: false, message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ success: true, message: 'Notification marked as read', notification });
    
  } catch (error) {
    console.error('Error marking doctor notification as read:', error);
    res.json({ success: false, message: error.message });
  }
};

// Mark all doctor notifications as read
const markAllDoctorNotificationsAsRead = async (req, res) => {
  try {
    const docId = req.body.docId;
    
    if (!docId) {
      return res.json({ success: false, message: 'Doctor ID is required' });
    }
    
    await notificationModel.updateMany(
      { userId: docId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
    
  } catch (error) {
    console.error('Error marking all doctor notifications as read:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get doctor unread notification count
const getDoctorUnreadCount = async (req, res) => {
  try {
    const docId = req.body.docId;
    
    if (!docId) {
      return res.json({ success: false, message: 'Doctor ID is required' });
    }
    
    const count = await notificationModel.countDocuments({ 
      userId: docId, 
      read: false 
    });
    
    res.json({ success: true, count });
    
  } catch (error) {
    console.error('Error getting doctor unread count:', error);
    res.json({ success: false, message: error.message });
  }
};

// Delete notification (for user)
const deleteNotification = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { notificationId } = req.body;
    
    if (!userId || !notificationId) {
      return res.json({ success: false, message: 'User ID and Notification ID are required' });
    }
    
    const notification = await notificationModel.findOne({ 
      _id: notificationId, 
      userId 
    });
    
    if (!notification) {
      return res.json({ success: false, message: 'Notification not found' });
    }
    
    await notificationModel.findByIdAndDelete(notificationId);
    
    res.json({ success: true, message: 'Notification deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.json({ success: false, message: error.message });
  }
};

// Delete doctor notification
const deleteDoctorNotification = async (req, res) => {
  try {
    const docId = req.body.docId;
    const { notificationId } = req.body;
    
    if (!docId || !notificationId) {
      return res.json({ success: false, message: 'Doctor ID and Notification ID are required' });
    }
    
    const notification = await notificationModel.findOne({ 
      _id: notificationId, 
      userId: docId 
    });
    
    if (!notification) {
      return res.json({ success: false, message: 'Notification not found' });
    }
    
    await notificationModel.findByIdAndDelete(notificationId);
    
    res.json({ success: true, message: 'Notification deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting doctor notification:', error);
    res.json({ success: false, message: error.message });
  }
};

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  getDoctorNotifications,
  markDoctorNotificationAsRead,
  markAllDoctorNotificationsAsRead,
  getDoctorUnreadCount,
  deleteDoctorNotification
};

