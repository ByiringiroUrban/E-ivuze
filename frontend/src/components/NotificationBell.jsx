import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { ChatContext } from '../context/ChatContext';

const NotificationBell = () => {
  const { token, backendUrl } = useContext(AppContext);
  const { socket } = useContext(ChatContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(backendUrl + '/api/user/notifications', {
        headers: { token }
      });

      if (data.success) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/notification/read',
        { notificationId },
        { headers: { token } }
      );

      if (data.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/notifications/read-all',
        {},
        { headers: { token } }
      );

      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation(); // Prevent marking as read when clicking delete

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/notification/delete',
        { notificationId },
        { headers: { token } }
      );

      if (data.success) {
        setNotifications(prev => {
          const updated = prev.filter(n => n._id !== notificationId);
          const unread = updated.filter(n => !n.read).length;
          setUnreadCount(unread);
          return updated;
        });
        toast.success('Notification deleted');
      } else {
        toast.error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log('🚀 Real-time notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Optional: Show a toast for the new notification
      toast.info(`🔔 ${notification.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  if (!token) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all font-bold"
      >
        <svg className="w-5 h-5 text-[#88C250]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#88C250] text-[#006838] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#006838]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPopup && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPopup(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-none shadow-2xl z-20 border-2 border-[#006838]/10 max-h-96 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#006838] hover:text-[#88C250] font-bold"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                      }}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all relative group ${!notification.read ? 'bg-primary/5' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read ? 'bg-[#88C250]' : 'bg-gray-300'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteNotification(notification._id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-red-50 rounded-none text-red-500 hover:text-red-700"
                          title="Delete notification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

