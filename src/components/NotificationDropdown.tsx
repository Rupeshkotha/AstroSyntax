import React from 'react';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  MegaphoneIcon,
  AtSymbolIcon,
} from '@heroicons/react/24/outline';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'TEAM_INVITATION':
    case 'TEAM_JOIN_REQUEST':
      return <UserGroupIcon className="w-5 h-5" />;
    case 'TEAM_JOIN_RESPONSE':
      return <CheckCircleIcon className="w-5 h-5" />;
    case 'TEAM_ANNOUNCEMENT':
      return <MegaphoneIcon className="w-5 h-5" />;
    case 'TEAM_MENTION':
      return <AtSymbolIcon className="w-5 h-5" />;
    case 'NEW_MESSAGE':
      return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    default:
      return <BellIcon className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'TEAM_INVITATION':
    case 'TEAM_JOIN_REQUEST':
      return 'text-blue-400';
    case 'TEAM_JOIN_RESPONSE':
      return 'text-green-400';
    case 'TEAM_ANNOUNCEMENT':
      return 'text-purple-400';
    case 'TEAM_MENTION':
      return 'text-yellow-400';
    case 'NEW_MESSAGE':
      return 'text-pink-400';
    default:
      return 'text-gray-400';
  }
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.link || '#'}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
                onClose();
              }}
              className={`block p-4 hover:bg-white/5 transition-colors ${
                !notification.read ? 'bg-blue-500/10' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => {
              clearNotifications();
              onClose();
            }}
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 